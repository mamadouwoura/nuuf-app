import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { analyserAvenant, type AvenantValide } from "@/lib/avenants";
import { enregistrerAvenant } from "@/lib/avenants-db";
import { genererAvenant } from "@/lib/avenant-pdf";
import { chargerBail } from "@/lib/contrat";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
const utilisateurs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.utilisateur.deleteMany({ where: { id: { in: utilisateurs } } }).catch(() => {});
  await db.$disconnect();
});

async function auteur() {
  const u = await db.utilisateur.create({ data: { telephone: `+22177${Math.floor(1_000_000 + Math.random() * 8_999_999)}`, nomComplet: "Auteur Test", motDePasse: "x" } });
  utilisateurs.push(u.id);
  return u.id;
}
const valide = (e: Parameters<typeof analyserAvenant>[0], bail: Parameters<typeof analyserAvenant>[1], now: Date): AvenantValide => {
  const r = analyserAvenant(e, bail, now);
  if (!r.ok) throw new Error(r.erreur);
  return r.avenant;
};

describe.skipIf(!baseDeTest)("avenants au bail", () => {
  it("un avenant de loyer change le bail et les échéances à venir non réglées, pas l'historique ni les loyers payés", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const uid = await auteur();
    const now = new Date();
    const ceMois = a.echeance.mois;
    const suivant = new Date(Date.UTC(ceMois.getUTCFullYear(), ceMois.getUTCMonth() + 1, 1));
    const passe = new Date(Date.UTC(ceMois.getUTCFullYear(), ceMois.getUTCMonth() - 1, 1));
    const echPasse = await db.echeance.create({ data: { bailId: a.bail.id, mois: passe, montantDu: 100_000, dateLimite: passe } });
    const echSuivant = await db.echeance.create({ data: { bailId: a.bail.id, mois: suivant, montantDu: 100_000, dateLimite: suivant } });
    // loyer du mois suivant déjà réglé d'avance : il ne doit pas bouger
    const echPaye = await db.echeance.create({ data: { bailId: a.bail.id, mois: new Date(Date.UTC(ceMois.getUTCFullYear(), ceMois.getUTCMonth() + 2, 1)), montantDu: 100_000, dateLimite: suivant, statut: "PAYEE" } });
    await db.paiement.create({ data: { echeanceId: echPaye.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: now } });

    const av = valide({ type: "LOYER", loyer: 130_000, effet: "suivant" }, a.bail, now);
    expect(await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: uid, avenant: av, now })).toBe(1);

    expect((await db.bail.findUniqueOrThrow({ where: { id: a.bail.id } })).loyerMensuel).toBe(130_000);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: a.echeance.id } })).montantDu).toBe(100_000); // ce mois : effet le mois prochain
    expect((await db.echeance.findUniqueOrThrow({ where: { id: echPasse.id } })).montantDu).toBe(100_000);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: echSuivant.id } })).montantDu).toBe(130_000);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: echPaye.id } })).montantDu).toBe(100_000);
    expect(await db.journalAction.count({ where: { organisationId: a.org.id, action: "avenant.loyer" } })).toBe(1);
  });

  it("effet « ce mois-ci » : l'échéance du mois en cours est aussi modifiée", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const now = new Date();
    const av = valide({ type: "LOYER", loyer: 80_000, effet: "courant" }, a.bail, now);
    await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: await auteur(), avenant: av, now });
    expect((await db.echeance.findUniqueOrThrow({ where: { id: a.echeance.id } })).montantDu).toBe(80_000);
  });

  it("les avenants sont numérotés par bail, dans l'ordre", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const uid = await auteur();
    const now = new Date();
    const clause = (t: string) => valide({ type: "CLAUSE", clause: t }, a.bail, now);
    const n1 = await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: uid, avenant: clause("Premier avenant, animal autorisé."), now });
    const n2 = await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: uid, avenant: clause("Deuxième avenant, parking inclus."), now });
    const autre = await enregistrerAvenant({ bailId: b.bail.id, organisationId: b.org.id, utilisateurId: uid, avenant: clause("Avenant d'un autre bail."), now });
    expect([n1, n2, autre]).toEqual([1, 2, 1]);
    expect((await db.bail.findUniqueOrThrow({ where: { id: a.bail.id } })).loyerMensuel).toBe(100_000); // une clause ne change rien d'autre
  });

  it("un avenant de durée met à jour la date de fin du bail", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const now = new Date();
    const fin = new Date(Date.UTC(now.getUTCFullYear() + 1, 5, 30));
    const av = valide({ type: "DUREE", finLe: fin.toISOString().slice(0, 10) }, a.bail, now);
    await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: await auteur(), avenant: av, now });
    expect((await db.bail.findUniqueOrThrow({ where: { id: a.bail.id } })).finLe?.toISOString()).toBe(fin.toISOString());
  });

  it("supprimer le bail supprime ses avenants, et le PDF de l'avenant se génère", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const now = new Date();
    const av = valide({ type: "LOYER", loyer: 125_000, effet: "suivant" }, a.bail, now);
    await enregistrerAvenant({ bailId: a.bail.id, organisationId: a.org.id, utilisateurId: await auteur(), avenant: av, now });
    const bail = await chargerBail(a.bien.id, a.org.id);
    const avenant = await db.avenant.findFirstOrThrow({ where: { bailId: a.bail.id } });
    const pdf = await genererAvenant(bail!, avenant, "Moussa Diop");
    expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1500);
    await db.bail.delete({ where: { id: a.bail.id } });
    expect(await db.avenant.count({ where: { bailId: a.bail.id } })).toBe(0);
  });
});
