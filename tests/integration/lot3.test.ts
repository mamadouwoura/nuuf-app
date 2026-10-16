import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { calculerBilan } from "@/lib/bilan";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.$disconnect();
});

const debutDuMois = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
};

/** Propriétaire avec deux biens : « principal » (mandat 1) et « residence » (mandat 2, taux différent). */
async function deuxPortefeuilles(opts: { pct1: number; pct2: number; agent2?: number }) {
  const a = await creerOrganisation({ loyer: 100_000 });
  orgs.push(a.org.id);
  const mois = debutDuMois();
  const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Propriétaire Portefeuilles" } });
  const m1 = await db.mandat.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, numero: "MG-2026-001", libelle: "Principal", commissionPct: opts.pct1, debutLe: mois, creeLe: new Date(Date.now() - 60_000) } });
  const m2 = await db.mandat.create({
    data: { organisationId: a.org.id, proprietaireId: proprio.id, numero: "MG-2026-002", libelle: "Résidence", commissionPct: opts.pct2, commissionAgentPct: opts.agent2 ?? 0, agentNom: opts.agent2 ? "Agent" : null, debutLe: mois },
  });
  // premier bien : sans portefeuille précis (suit le principal)
  await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
  await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
  // second bien : affecté au mandat 2
  const bien2 = await db.bien.create({ data: { organisationId: a.org.id, designation: "Résidence A2", type: "APPARTEMENT", quartier: "Almadies", ville: "Dakar", proprietaireId: proprio.id, mandatId: m2.id } });
  const loc2 = await db.locataire.create({ data: { organisationId: a.org.id, nomComplet: "Locataire 2", telephone: "+221770000001" } });
  const bail2 = await db.bail.create({ data: { bienId: bien2.id, locataireId: loc2.id, loyerMensuel: 200_000, jourEcheance: 5, debutLe: new Date(mois.getTime() - 90 * 86_400_000) } });
  const ech2 = await db.echeance.create({ data: { bailId: bail2.id, mois, montantDu: 200_000, dateLimite: mois } });
  await db.paiement.create({ data: { echeanceId: ech2.id, montant: 200_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
  return { a, proprio, m1, m2, bien2, mois };
}

describe.skipIf(!baseDeTest)("plusieurs portefeuilles pour un propriétaire", () => {
  it("applique à chaque bien le taux de son mandat", async () => {
    const { a, proprio, m1, m2, mois } = await deuxPortefeuilles({ pct1: 10, pct2: 5 });
    const b = await calculerBilan(a.org.id, proprio.id, mois);
    expect(b!.encaisse).toBe(300_000);
    expect(b!.parMandat).toHaveLength(2);
    const p1 = b!.parMandat.find((m) => m.id === m1.id)!;
    const p2 = b!.parMandat.find((m) => m.id === m2.id)!;
    expect([p1.encaisse, p1.commission]).toEqual([100_000, 10_000]);
    expect([p2.encaisse, p2.commission]).toEqual([200_000, 10_000]);
    expect(b!.commission).toBe(20_000);
    expect(b!.net).toBe(280_000);
    // taux effectif affiché quand plusieurs portefeuilles s'appliquent : 20 000 / 300 000
    expect(b!.commissionPct).toBeCloseTo(6.7, 1);
    expect(b!.lignes.find((l) => l.designation === "Résidence A2")?.mandatId).toBe(m2.id);
  });

  it("calcule la part de l'agent portefeuille par portefeuille", async () => {
    const { a, proprio, mois } = await deuxPortefeuilles({ pct1: 10, pct2: 8, agent2: 3 });
    const b = await calculerBilan(a.org.id, proprio.id, mois);
    expect(b!.commission).toBe(10_000 + 16_000);
    expect(b!.commissionAgent).toBe(6_000); // 3 % de 200 000, uniquement sur le portefeuille 2
    expect(b!.margeAgence).toBe(26_000 - 6_000);
  });

  it("un mandat terminé renvoie ses biens au mandat principal", async () => {
    const { a, proprio, m1, m2, bien2, mois } = await deuxPortefeuilles({ pct1: 10, pct2: 5 });
    // comme l'action « terminer le mandat » : le mandat devient inactif et ses biens sont libérés
    await db.$transaction([db.bien.updateMany({ where: { mandatId: m2.id }, data: { mandatId: null } }), db.mandat.update({ where: { id: m2.id }, data: { actif: false } })]);
    const b = await calculerBilan(a.org.id, proprio.id, mois);
    expect(b!.parMandat).toHaveLength(1);
    expect(b!.parMandat[0].id).toBe(m1.id);
    expect(b!.commission).toBe(30_000); // 10 % sur 300 000
    expect(b!.lignes.every((l) => l.mandatId === m1.id)).toBe(true);
    expect((await db.bien.findUnique({ where: { id: bien2.id } }))!.mandatId).toBeNull();
  });

  it("un bien affecté à un mandat devenu inactif suit le principal sans erreur", async () => {
    const { a, proprio, m2, mois } = await deuxPortefeuilles({ pct1: 10, pct2: 5 });
    await db.mandat.update({ where: { id: m2.id }, data: { actif: false } }); // le bien garde son mandatId
    const b = await calculerBilan(a.org.id, proprio.id, mois);
    expect(b!.commission).toBe(30_000);
  });

  it("sans aucun mandat, la commission est nulle", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Sans mandat" } });
    await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    const b = await calculerBilan(a.org.id, proprio.id, debutDuMois());
    expect(b!.parMandat).toHaveLength(0);
    expect(b!.commission).toBe(0);
    expect(b!.net).toBe(100_000);
  });
});

describe.skipIf(!baseDeTest)("invitations en base", () => {
  it("le jeton est unique et une invitation supprimée disparaît avec l'organisation", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    await db.invitation.create({ data: { organisationId: a.org.id, jetonHash: `h-${a.org.id}`, nomComplet: "Awa Test", telephone: "+221770001234", role: "GESTIONNAIRE", modulesRefuses: ["TRESORERIE"], expireLe: new Date(Date.now() + 86_400_000) } });
    await expect(db.invitation.create({ data: { organisationId: a.org.id, jetonHash: `h-${a.org.id}`, nomComplet: "Autre", telephone: "+221770009876", role: "LECTURE_SEULE", expireLe: new Date() } })).rejects.toThrow();
    const inv = await db.invitation.findFirstOrThrow({ where: { organisationId: a.org.id } });
    expect(inv.modulesRefuses).toEqual(["TRESORERIE"]);
    await supprimerOrganisation(a.org.id);
    expect(await db.invitation.count({ where: { organisationId: a.org.id } })).toBe(0);
    orgs.pop();
  });
});
