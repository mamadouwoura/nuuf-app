import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { PLAFOND_CONSULTATIONS, chercherHistorique, consultationsDuJour } from "@/lib/historique";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const JOUR = 86_400_000;
const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.$disconnect();
});

const tel = () => `+22177${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;

/** Donne un historique à un locataire : `aTemps` loyers réglés à temps, `enRetard` réglés en retard, `impayes` jamais réglés. */
async function historiser(bailId: string, o: { aTemps: number; enRetard: number; impayes: number }) {
  let m = 0;
  const ajouter = async (statut: "PAYEE" | "EN_RETARD", jourPaiement: number | null) => {
    m++;
    const mois = new Date(Date.UTC(2025, m, 1));
    const dateLimite = new Date(Date.UTC(2025, m, 5));
    const e = await db.echeance.create({ data: { bailId, mois, montantDu: 100_000, dateLimite, statut } });
    if (jourPaiement !== null) {
      await db.paiement.create({
        data: { echeanceId: e.id, montant: 100_000, canal: "WAVE", statut: "CONFIRME", recuLe: new Date(dateLimite.getTime() + jourPaiement * JOUR) },
      });
    }
  };
  for (let i = 0; i < o.aTemps; i++) await ajouter("PAYEE", -1);
  for (let i = 0; i < o.enRetard; i++) await ajouter("PAYEE", 10);
  for (let i = 0; i < o.impayes; i++) await ajouter("EN_RETARD", null);
}

describe.skipIf(!baseDeTest)("historique locatif entre agences", () => {
  it("révèle l'historique aux autres agences, seulement avec le consentement du locataire", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const numero = tel();
    await db.locataire.update({ where: { id: a.locataire.id }, data: { telephone: numero, consentementHistoriqueLe: new Date() } });
    await db.bail.update({ where: { id: a.bail.id }, data: { actif: false, finLe: new Date(), motifFin: "DEPART_LOCATAIRE", apprLogement: "SOIGNE", apprRegles: "BON", apprSortie: "USURE_NORMALE", apprRelouer: "OUI" } });
    await db.echeance.deleteMany({ where: { bailId: a.bail.id } });
    await historiser(a.bail.id, { aTemps: 5, enRetard: 2, impayes: 1 });

    const vu = await chercherHistorique(b.org.id, numero);
    expect(vu).not.toBeNull();
    expect(vu!.dossiers).toHaveLength(1);
    expect(vu!.echeances).toBe(8);
    expect(vu!.aTemps).toBe(5);
    expect(vu!.enRetard).toBe(2);
    expect(vu!.impayes).toBe(1);
    expect(vu!.dossiers[0].motifFin).toBe("DEPART_LOCATAIRE");
    expect(vu!.dossiers[0].agence).toBe(a.org.nom);
    expect(vu!.dossiers[0].appreciation).toEqual({ logement: "SOIGNE", regles: "BON", sortie: "USURE_NORMALE", relouer: "OUI" });

    // Sans consentement : aucune trace, pas même l'existence du dossier.
    await db.locataire.update({ where: { id: a.locataire.id }, data: { consentementHistoriqueLe: null } });
    expect(await chercherHistorique(b.org.id, numero)).toBeNull();
  });

  it("retrouve un locataire par son numéro de pièce d'identité, même avec un autre téléphone", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const piece = `SN${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
    await db.locataire.update({ where: { id: a.locataire.id }, data: { telephone: tel(), cni: piece.replace(/^(..)(...)/, "$1 $2-"), cniNorm: piece, consentementHistoriqueLe: new Date() } });
    const vu = await chercherHistorique(b.org.id, { telephone: tel(), cniNorm: piece });
    expect(vu).not.toBeNull();
    expect(vu!.dossiers).toHaveLength(1);
    expect(vu!.dossiers[0].nom).toBe(a.locataire.nomComplet);
    // Un numéro de pièce différent ne trouve rien
    expect(await chercherHistorique(b.org.id, { cniNorm: "ZZ99999999" })).toBeNull();
    // Sans aucun critère : aucun résultat
    expect(await chercherHistorique(b.org.id, {})).toBeNull();
  });

  it("n'inclut jamais l'organisation qui cherche", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const numero = tel();
    await db.locataire.update({ where: { id: a.locataire.id }, data: { telephone: numero, consentementHistoriqueLe: new Date() } });
    expect(await chercherHistorique(a.org.id, numero)).toBeNull();
  });

  it("n'expose pas le motif de fin d'une location encore en cours", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const numero = tel();
    await db.locataire.update({ where: { id: a.locataire.id }, data: { telephone: numero, consentementHistoriqueLe: new Date() } });
    await db.bail.update({ where: { id: a.bail.id }, data: { motifFin: "AUTRE", apprRelouer: "NON" } });
    const vu = await chercherHistorique(b.org.id, numero);
    expect(vu!.dossiers[0].enCours).toBe(true);
    expect(vu!.dossiers[0].motifFin).toBeNull();
    expect(vu!.dossiers[0].appreciation).toBeNull();
  });

  it("compte les consultations des dernières 24 h par organisation", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    expect(await consultationsDuJour(a.org.id)).toBe(0);
    await db.consultationHistorique.createMany({
      data: [
        { organisationId: a.org.id, telephone: "+221770000001", dossiers: 0 },
        { organisationId: a.org.id, telephone: "+221770000002", dossiers: 1 },
        { organisationId: a.org.id, telephone: "+221770000003", dossiers: 0, creeLe: new Date(Date.now() - 3 * JOUR) },
      ],
    });
    expect(await consultationsDuJour(a.org.id)).toBe(2);
    expect(PLAFOND_CONSULTATIONS).toBeGreaterThan(2);
  });
});
