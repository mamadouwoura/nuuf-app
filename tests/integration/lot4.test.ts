import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const envoyer = vi.fn();
vi.mock("web-push", () => ({ default: { setVapidDetails: vi.fn(), sendNotification: (...a: unknown[]) => envoyer(...a) } }));

import { db } from "@/lib/db";
import { envoyerRappel, type CibleRappel } from "@/lib/rappels";
import { pousserDes, pousserVers } from "@/lib/push";
import { notifier } from "@/lib/notifications";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
const utilisateurs: string[] = [];
const ancienEnv = { ...process.env };

beforeAll(() => {
  process.env.VAPID_PUBLIC_KEY = "pub";
  process.env.VAPID_PRIVATE_KEY = "priv";
  process.env.VAPID_SUBJECT = "mailto:test@exemple.sn";
});
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.utilisateur.deleteMany({ where: { id: { in: utilisateurs } } }).catch(() => {});
  await db.$disconnect();
  process.env = ancienEnv;
});

async function membre(orgId: string) {
  const u = await db.utilisateur.create({ data: { telephone: `+22177${randomBytes(4).readUInt32BE().toString().slice(0, 7).padStart(7, "0")}`, nomComplet: "Membre Test", motDePasse: "x" } });
  utilisateurs.push(u.id);
  await db.membre.create({ data: { organisationId: orgId, utilisateurId: u.id, role: "PROPRIETAIRE" } });
  return u;
}
const appareil = (utilisateurId: string, n: string) =>
  db.abonnementPush.create({ data: { utilisateurId, endpoint: `https://fcm.googleapis.com/fcm/send/${n}-${randomBytes(4).toString("hex")}`, p256dh: "p256dh-test", auth: "auth-test" } });

describe.skipIf(!baseDeTest)("notifications push", () => {
  it("envoie la charge à chaque appareil de l'utilisateur", async () => {
    envoyer.mockReset().mockResolvedValue({ statusCode: 201 });
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const u = await membre(a.org.id);
    await appareil(u.id, "tel");
    await appareil(u.id, "pc");
    const n = await pousserVers(u.id, { titre: "Paiement reçu", texte: "Awa a payé 60 000 FCFA.", lien: "/quittances" });
    expect(n).toBe(2);
    expect(envoyer).toHaveBeenCalledTimes(2);
    const charge = JSON.parse(envoyer.mock.calls[0][1] as string);
    expect(charge).toMatchObject({ titre: "Paiement reçu", lien: "/quittances" });
  });

  it("retire les appareils que le service déclare disparus (410) et garde les autres", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const u = await membre(a.org.id);
    const mort = await appareil(u.id, "mort");
    const vivant = await appareil(u.id, "vivant");
    envoyer.mockReset().mockImplementation(async (sub: { endpoint: string }) => {
      if (sub.endpoint === mort.endpoint) throw Object.assign(new Error("Gone"), { statusCode: 410 });
      return { statusCode: 201 };
    });
    expect(await pousserVers(u.id, { titre: "Test" })).toBe(1);
    expect(await db.abonnementPush.count({ where: { id: mort.id } })).toBe(0);
    expect(await db.abonnementPush.count({ where: { id: vivant.id } })).toBe(1);
  });

  it("une panne temporaire n'efface pas l'appareil et ne fait pas échouer l'envoi", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const u = await membre(a.org.id);
    await appareil(u.id, "panne");
    envoyer.mockReset().mockRejectedValue(Object.assign(new Error("indisponible"), { statusCode: 503 }));
    expect(await pousserVers(u.id, { titre: "Test" })).toBe(0);
    expect(await db.abonnementPush.count({ where: { utilisateurId: u.id } })).toBe(1);
  });

  it("une notification de l'application produit un push pour les seuls destinataires abonnés", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const abonne = await membre(a.org.id);
    const sans = await membre(a.org.id);
    await appareil(abonne.id, "abonne");
    envoyer.mockReset().mockResolvedValue({ statusCode: 201 });
    await notifier(db, { organisationId: a.org.id, categorie: "BIENS", titre: "Nouveau bien", texte: "{bien} a été ajouté au parc.", donnees: { bien: "Villa Test" }, lien: "/biens" });
    const ids = (await db.notification.findMany({ where: { organisationId: a.org.id }, select: { id: true } })).map((n) => n.id);
    expect(ids).toHaveLength(2);
    await pousserDes(ids);
    expect(envoyer).toHaveBeenCalledTimes(1);
    expect(JSON.parse(envoyer.mock.calls[0][1] as string).texte).toBe("Villa Test a été ajouté au parc.");
    expect(sans.id).not.toBe(abonne.id);
  });

  it("l'appareil d'un compte supprimé disparaît avec lui", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const u = await membre(a.org.id);
    await appareil(u.id, "suppr");
    await db.utilisateur.delete({ where: { id: u.id } });
    expect(await db.abonnementPush.count({ where: { utilisateurId: u.id } })).toBe(0);
  });
});

describe.skipIf(!baseDeTest)("rappels de renouvellement", () => {
  const cible = (organisationId: string, extra: Partial<CibleRappel> = {}): CibleRappel => ({ organisationId, nom: "Org", prenom: "Awa", telephone: "+221770001122", motif: "ESSAI_BIENTOT", jours: 2, ...extra });

  it("envoie un rappel, une alerte dans l'application, puis refuse de recommencer avant 3 jours", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const u = await membre(a.org.id);
    expect(await envoyerRappel(cible(a.org.id))).toBe("envoye");
    expect(await db.message.count({ where: { organisationId: a.org.id, type: "RENOUVELLEMENT" } })).toBe(1);
    const n = await db.notification.findFirstOrThrow({ where: { utilisateurId: u.id } });
    expect(n.categorie).toBe("ABONNEMENT");
    expect(n.titre).toBe("Rappel d'abonnement");
    expect(await envoyerRappel(cible(a.org.id))).toBe("deja");
    expect(await db.message.count({ where: { organisationId: a.org.id, type: "RENOUVELLEMENT" } })).toBe(1);
  });

  it("relance de nouveau quand le délai est passé", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    await membre(a.org.id);
    expect(await envoyerRappel(cible(a.org.id))).toBe("envoye");
    const dansQuatreJours = new Date(Date.now() + 4 * 86_400_000);
    expect(await envoyerRappel(cible(a.org.id), dansQuatreJours)).toBe("envoye");
  });

  it("ne fait rien sans numéro de téléphone, et ne mélange pas les organisations", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    await membre(a.org.id);
    expect(await envoyerRappel(cible(a.org.id, { telephone: null }))).toBe("sans_numero");
    expect(await envoyerRappel(cible(a.org.id))).toBe("envoye");
    expect(await envoyerRappel(cible(b.org.id))).toBe("envoye"); // le rappel de A ne bloque pas B
  });
});
