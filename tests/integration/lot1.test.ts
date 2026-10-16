import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { calculerBilan, recapitulatifDuMois } from "@/lib/bilan";
import { statistiques } from "@/lib/stats";
import { tresorerieDuMois } from "@/lib/tresorerie";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.$disconnect();
});

const JOUR = 86_400_000;
const debutDuMois = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
};
const moisPlusTard = (m: Date, k: number) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + k, 1));

async function agenceAvecProprietaire(loyer: number, opts: { commissionPct?: number; agentPct?: number; encaisse?: number } = {}) {
  const a = await creerOrganisation({ loyer });
  orgs.push(a.org.id);
  const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Propriétaire Lot1" } });
  await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
  await db.mandat.create({
    data: {
      organisationId: a.org.id,
      proprietaireId: proprio.id,
      numero: "MG-2026-001",
      commissionPct: opts.commissionPct ?? 10,
      commissionAgentPct: opts.agentPct ?? 0,
      agentNom: opts.agentPct ? "Agent Test" : null,
      debutLe: debutDuMois(),
    },
  });
  if (opts.encaisse) await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: opts.encaisse, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
  return { ...a, proprio };
}

describe.skipIf(!baseDeTest)("commission de l'agent", () => {
  it("est prélevée sur la commission de l'agence sans changer le net du propriétaire", async () => {
    const a = await agenceAvecProprietaire(200_000, { commissionPct: 10, agentPct: 3, encaisse: 200_000 });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.commission).toBe(20_000);
    expect(b!.commissionAgent).toBe(6_000);
    expect(b!.margeAgence).toBe(14_000);
    expect(b!.net).toBe(180_000);
  });
  it("ne dépasse jamais la commission de l'agence", async () => {
    const a = await agenceAvecProprietaire(100_000, { commissionPct: 5, agentPct: 8, encaisse: 100_000 });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.commission).toBe(5_000);
    expect(b!.commissionAgent).toBe(5_000);
    expect(b!.margeAgence).toBe(0);
  });
});

describe.skipIf(!baseDeTest)("avances aux propriétaires", () => {
  it("sont remboursées sur le bilan dans la limite de la mensualité", async () => {
    const a = await agenceAvecProprietaire(200_000, { commissionPct: 10, encaisse: 200_000 });
    await db.avanceProprietaire.create({
      data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 150_000, accordeLe: new Date(Date.now() - 5 * JOUR), mensualite: 50_000, motif: "Scolarité" },
    });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.avances).toHaveLength(1);
    expect(b!.avances[0].resteDebut).toBe(150_000);
    expect(b!.avances[0].prelevement).toBe(50_000);
    expect(b!.avances[0].resteApres).toBe(100_000);
    expect(b!.totalAvances).toBe(50_000);
    // 200 000 − commission 20 000 − avance 50 000
    expect(b!.net).toBe(130_000);
  });

  it("ne rendent jamais le net négatif", async () => {
    const a = await agenceAvecProprietaire(100_000, { commissionPct: 10, encaisse: 30_000 });
    await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 500_000, accordeLe: new Date(Date.now() - 2 * JOUR) } });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.net).toBe(0);
    expect(b!.avances[0].prelevement).toBe(27_000);
  });

  it("n'apparaissent pas avant leur date d'octroi", async () => {
    const a = await agenceAvecProprietaire(100_000, { encaisse: 100_000 });
    await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 80_000, accordeLe: moisPlusTard(debutDuMois(), 2) } });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.avances).toHaveLength(0);
    expect(b!.net).toBe(90_000);
  });

  it("repartent du reste réel quand un remboursement du mois précédent est enregistré", async () => {
    const a = await agenceAvecProprietaire(100_000, { commissionPct: 0, encaisse: 100_000 });
    const avance = await db.avanceProprietaire.create({
      data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 120_000, accordeLe: moisPlusTard(debutDuMois(), -2), mensualite: 60_000 },
    });
    await db.remboursementAvance.create({ data: { avanceId: avance.id, organisationId: a.org.id, montant: 60_000, mois: moisPlusTard(debutDuMois(), -1) } });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.avances[0].resteDebut).toBe(60_000);
    expect(b!.avances[0].prelevement).toBe(60_000);
    expect(b!.avances[0].resteApres).toBe(0);
  });

  it("un versement fait à part réduit le reste dû", async () => {
    const a = await agenceAvecProprietaire(100_000, { commissionPct: 0, encaisse: 100_000 });
    const avance = await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 100_000, accordeLe: new Date(Date.now() - 3 * JOUR) } });
    await db.remboursementAvance.create({ data: { avanceId: avance.id, organisationId: a.org.id, montant: 40_000 } });
    const b = await calculerBilan(a.org.id, a.proprio.id, debutDuMois());
    expect(b!.avances[0].resteDebut).toBe(60_000);
    expect(b!.avances[0].prelevement).toBe(60_000);
  });

  it("le récapitulatif additionne avances et part des agents", async () => {
    const a = await agenceAvecProprietaire(100_000, { commissionPct: 10, agentPct: 2, encaisse: 100_000 });
    await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 25_000, accordeLe: new Date(Date.now() - JOUR) } });
    const r = await recapitulatifDuMois(a.org.id, debutDuMois());
    expect(r.commissionAgent).toBe(2_000);
    expect(r.margeAgence).toBe(8_000);
    expect(r.avances).toBe(25_000);
    expect(r.net).toBe(100_000 - 10_000 - 25_000);
  });
});

describe.skipIf(!baseDeTest)("statistiques", () => {
  it("calcule recouvrement, occupation et arriérés par ancienneté", async () => {
    const a = await creerOrganisation({ loyer: 100_000, jourDeLimite: -45 });
    orgs.push(a.org.id);
    await db.bien.create({ data: { organisationId: a.org.id, designation: "Bien vacant", type: "STUDIO", quartier: "Plateau", ville: "Dakar" } });
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 40_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    await db.echeance.update({ where: { id: a.echeance.id }, data: { statut: "PARTIELLE" } });
    const s = await statistiques(a.org.id, debutDuMois());
    expect(s.attendu).toBe(100_000);
    expect(s.encaisse).toBe(40_000);
    expect(s.tauxRecouvrement).toBe(40);
    expect(s.occupation).toMatchObject({ biens: 2, occupes: 1, vacants: 1, taux: 50 });
    expect(s.arrieres.nb).toBe(1);
    expect(s.arrieres.total).toBe(60_000);
    expect(s.arrieres.tranches.find((t) => t.cle === "31-60")?.montant).toBe(60_000);
    expect(s.arrieres.tranches.find((t) => t.cle === "0-30")?.nb).toBe(0);
    expect(s.tendance).toHaveLength(6);
  });

  it("n'inclut jamais les données d'une autre organisation", async () => {
    const a = await creerOrganisation({ loyer: 100_000, jourDeLimite: -10 });
    const b = await creerOrganisation({ loyer: 70_000 });
    orgs.push(a.org.id, b.org.id);
    const s = await statistiques(b.org.id, debutDuMois());
    expect(s.attendu).toBe(70_000);
    expect(s.arrieres.total).toBeLessThanOrEqual(70_000);
  });
});

describe.skipIf(!baseDeTest)("trésorerie de l'agence", () => {
  it("additionne loyers, dépenses, avances et reversements du mois", async () => {
    const a = await agenceAvecProprietaire(200_000, { commissionPct: 10, encaisse: 200_000 });
    const mois = debutDuMois();
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "SORTIE", categorie: "Travaux et entretien", libelle: "Plomberie", montant: 15_000, date: new Date() } });
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "ENTREE", categorie: "Frais de dossier", libelle: "Dossier Awa", montant: 5_000, date: new Date() } });
    await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, montant: 20_000, accordeLe: new Date() } });
    await db.reversement.create({ data: { organisationId: a.org.id, proprietaireId: a.proprio.id, mois, montant: 150_000, reverseLe: new Date() } });
    const r = await tresorerieDuMois(a.org.id, mois);
    expect(r.loyers).toBe(200_000);
    expect(r.autresEntrees).toBe(5_000);
    expect(r.depenses).toBe(15_000);
    expect(r.avances).toBe(20_000);
    expect(r.reversements).toBe(150_000);
    expect(r.entrees).toBe(205_000);
    expect(r.sorties).toBe(185_000);
    expect(r.solde).toBe(20_000);
    expect(r.depensesParCategorie).toEqual([{ categorie: "Travaux et entretien", montant: 15_000 }]);
  });

  it("isole les organisations", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "SORTIE", categorie: "Autre", libelle: "Privé", montant: 9_000, date: new Date() } });
    const r = await tresorerieDuMois(b.org.id, debutDuMois());
    expect(r.depenses).toBe(0);
    expect(r.transactions).toHaveLength(0);
  });
});
