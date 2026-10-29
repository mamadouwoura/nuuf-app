import { afterAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { lancerRelancesAutomatiques } from "@/lib/relances-auto";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id);
  await db.$disconnect();
});

/** Aujourd'hui à midi (heure de Dakar = GMT) : après l'heure d'envoi par défaut (9 h), quel que soit le moment où les tests tournent. */
const midi = (decalageJours = 0) => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + decalageJours, 12));
};
const relancesDe = (echeanceId: string) => db.relance.findMany({ where: { echeanceId } });
async function reglages(organisationId: string, regles: [number, boolean][], extra: { heureEnvoi?: number; modeleAvant?: string | null; modeleRetard?: string | null } = {}) {
  await db.parametresRelance.create({ data: { organisationId, ...extra } });
  await db.regleRelance.createMany({ data: regles.map(([jours, actif]) => ({ organisationId, jours, actif })) });
}

describe.skipIf(!baseDeTest)("relances automatiques", () => {
  it("envoie le rappel J+1 une seule fois, même si le planificateur repasse", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques(midi());
    await lancerRelancesAutomatiques(midi());
    const r = await relancesDe(a.echeance.id);
    expect(r.map((x) => x.declencheur)).toEqual(["J+1"]);
    const messages = await db.message.count({ where: { organisationId: a.org.id, type: "RELANCE" } });
    expect(messages).toBe(1);
  });

  it("envoie le rappel J-3 avant l'échéance", async () => {
    const a = await creerOrganisation({ jourDeLimite: 2 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques(midi());
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["J-3"]);
  });

  it("crée l'échéance du mois même si le bailleur n'ouvre jamais l'application", async () => {
    const a = await creerOrganisation({ jourDeLimite: 10 });
    orgs.push(a.org.id);
    await db.echeance.deleteMany({ where: { bailId: a.bail.id } });
    expect(await db.echeance.count({ where: { bailId: a.bail.id } })).toBe(0);
    await lancerRelancesAutomatiques(midi());
    const maintenant = new Date();
    const mois = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1));
    expect(await db.echeance.count({ where: { bailId: a.bail.id, mois } })).toBe(1);
  });

  it("n'envoie rien si le loyer est déjà soldé", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME" } });
    await db.echeance.update({ where: { id: a.echeance.id }, data: { statut: "PAYEE" } });
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });

  it("respecte les règles désactivées par le bailleur", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, [[-3, true], [1, false], [5, true]]);
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });

  it("n'envoie rien aux comptes en lecture seule (abonnement expiré)", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2, periodeFinJours: -30 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });
});

describe.skipIf(!baseDeTest)("relances programmables : règles, heure, texte", () => {
  it("applique des règles personnalisées (ici 3 jours après l'échéance)", async () => {
    const a = await creerOrganisation({ jourDeLimite: -3 });
    orgs.push(a.org.id);
    await reglages(a.org.id, [[2, true], [3, true], [10, true]]);
    await lancerRelancesAutomatiques(midi());
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["J+3"]);
  });

  it("une règle « le jour de l'échéance » part le jour même", async () => {
    const a = await creerOrganisation({ jourDeLimite: 0 });
    orgs.push(a.org.id);
    await reglages(a.org.id, [[0, true]]);
    await lancerRelancesAutomatiques(midi());
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["J+0"]);
  });

  it("n'envoie qu'à partir de l'heure choisie", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, [[1, true]], { heureEnvoi: 15 });
    await lancerRelancesAutomatiques(midi()); // 12 h : trop tôt
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
    const n = midi();
    n.setUTCHours(15, 30);
    await lancerRelancesAutomatiques(n); // 15 h 30 : c'est l'heure
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["J+1"]);
  });

  it("sans aucune règle, aucune relance automatique", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, []);
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });

  it("utilise le texte personnalisé avec ses variables, et le texte par défaut sinon", async () => {
    const journal = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const a = await creerOrganisation({ jourDeLimite: -2, loyer: 150_000 });
      const b = await creerOrganisation({ jourDeLimite: -2, loyer: 150_000 });
      orgs.push(a.org.id, b.org.id);
      await reglages(a.org.id, [[1, true]], { modeleRetard: "Salut {prenom}, {jours} j de retard pour {bien} : {montant}. Paiement : {lien}" });
      await lancerRelancesAutomatiques(midi());
      const lignes = journal.mock.calls.map((c) => String(c[0]));
      const perso = lignes.find((l) => l.includes("de retard pour") && l.includes(a.bien.designation));
      expect(perso).toBeDefined();
      expect(perso).toMatch(/Salut Locataire, 2 j de retard pour .+ : 150[\s  ]000 FCFA\. Paiement : http/);
      const defaut = lignes.find((l) => l.includes(b.bien.designation));
      expect(defaut).toContain("est arrivé à échéance");
    } finally {
      journal.mockRestore();
    }
  });
});

describe.skipIf(!baseDeTest)("relances programmées à une date précise", () => {
  const programmer = (organisationId: string, echeanceId: string, envoiLe: Date) => db.relanceProgrammee.create({ data: { organisationId, echeanceId, envoiLe } });

  it("envoie une relance programmée dont l'heure est venue, une seule fois", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, []); // pas de règle automatique : seule la relance programmée part
    const p = await programmer(a.org.id, a.echeance.id, new Date(midi().getTime() - 3_600_000));
    await lancerRelancesAutomatiques(midi());
    await lancerRelancesAutomatiques(midi());
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["programmée"]);
    expect((await db.relanceProgrammee.findUniqueOrThrow({ where: { id: p.id } })).envoyeeLe).not.toBeNull();
    expect(await db.message.count({ where: { organisationId: a.org.id, type: "RELANCE" } })).toBe(1);
  });

  it("n'envoie pas avant l'heure programmée", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, []);
    const p = await programmer(a.org.id, a.echeance.id, new Date(midi().getTime() + 2 * 3_600_000));
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
    expect((await db.relanceProgrammee.findUniqueOrThrow({ where: { id: p.id } })).envoyeeLe).toBeNull();
  });

  it("annule la relance si le loyer a été payé entre-temps", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await reglages(a.org.id, []);
    const p = await programmer(a.org.id, a.echeance.id, new Date(midi().getTime() - 3_600_000));
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME" } });
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
    const apres = await db.relanceProgrammee.findUniqueOrThrow({ where: { id: p.id } });
    expect(apres.envoyeeLe).toBeNull();
    expect(apres.annuleeLe).not.toBeNull();
  });

  it("ne touche pas aux relances annulées ni à celles d'un compte en lecture seule", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    const b = await creerOrganisation({ jourDeLimite: -2, periodeFinJours: -30 });
    orgs.push(a.org.id, b.org.id);
    await reglages(a.org.id, []);
    await reglages(b.org.id, []);
    await db.relanceProgrammee.create({ data: { organisationId: a.org.id, echeanceId: a.echeance.id, envoiLe: new Date(midi().getTime() - 3_600_000), annuleeLe: new Date() } });
    const pb = await programmer(b.org.id, b.echeance.id, new Date(midi().getTime() - 3_600_000));
    await lancerRelancesAutomatiques(midi());
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
    expect(await relancesDe(b.echeance.id)).toHaveLength(0);
    expect((await db.relanceProgrammee.findUniqueOrThrow({ where: { id: pb.id } })).envoyeeLe).toBeNull();
  });

  it("supprimer l'organisation supprime ses règles et ses relances programmées", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    await reglages(a.org.id, [[1, true]]);
    await programmer(a.org.id, a.echeance.id, midi());
    await supprimerOrganisation(a.org.id);
    expect(await db.regleRelance.count({ where: { organisationId: a.org.id } })).toBe(0);
    expect(await db.relanceProgrammee.count({ where: { organisationId: a.org.id } })).toBe(0);
  });
});
