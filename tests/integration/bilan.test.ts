import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { calculerBilan, commissionSur, prochainNumeroMandat, recapitulatifDuMois } from "@/lib/bilan";
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

describe("commission", () => {
  it("arrondit au franc et applique le pourcentage sur l'encaissé", () => {
    expect(commissionSur(250_000, 10)).toBe(25_000);
    expect(commissionSur(150_000, 7.5)).toBe(11_250);
    expect(commissionSur(100_001, 10)).toBe(10_000);
    expect(commissionSur(0, 10)).toBe(0);
  });
});

describe.skipIf(!baseDeTest)("bilan mensuel d'un propriétaire", () => {
  it("calcule encaissé, commission, retenues, net, et n'inclut que les biens du propriétaire", async () => {
    const a = await creerOrganisation({ loyer: 200_000 });
    orgs.push(a.org.id);
    const mois = debutDuMois();
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Propriétaire A", telephone: "+221770001111" } });
    const autre = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Autre propriétaire" } });
    await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
    await db.mandat.create({
      data: { organisationId: a.org.id, proprietaireId: proprio.id, numero: await prochainNumeroMandat(a.org.id), commissionPct: 10, debutLe: mois },
    });
    // 120 000 encaissés sur 200 000 dus
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 120_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    await db.retenueBilan.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, mois, libelle: "Plomberie", montant: 5_000 } });

    const b = await calculerBilan(a.org.id, proprio.id, mois);
    expect(b).not.toBeNull();
    expect(b!.lignes).toHaveLength(1);
    expect(b!.attendu).toBe(200_000);
    expect(b!.encaisse).toBe(120_000);
    expect(b!.impayes).toBe(80_000);
    expect(b!.commissionPct).toBe(10);
    expect(b!.commission).toBe(12_000);
    expect(b!.totalRetenues).toBe(5_000);
    expect(b!.net).toBe(103_000);
    expect(b!.lignes[0].etat).toBe("PARTIEL");

    // L'autre propriétaire n'a aucun bien : rien à lui attribuer
    const vide = await calculerBilan(a.org.id, autre.id, mois);
    expect(vide!.lignes).toHaveLength(0);
    expect(vide!.net).toBe(0);
  });

  it("sans mandat, la commission est nulle", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Sans mandat" } });
    await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    const b = await calculerBilan(a.org.id, proprio.id, debutDuMois());
    expect(b!.mandat).toBeNull();
    expect(b!.commission).toBe(0);
    expect(b!.net).toBe(100_000);
  });

  it("isole les organisations : un propriétaire d'une autre agence est introuvable", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Privé" } });
    expect(await calculerBilan(b.org.id, proprio.id, debutDuMois())).toBeNull();
    const recap = await recapitulatifDuMois(b.org.id, debutDuMois());
    expect(recap.bilans).toHaveLength(0);
  });

  it("un reversement enregistré apparaît dans le bilan", async () => {
    const a = await creerOrganisation({ loyer: 50_000 });
    orgs.push(a.org.id);
    const mois = debutDuMois();
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Reversé" } });
    await db.bien.update({ where: { id: a.bien.id }, data: { proprietaireId: proprio.id } });
    await db.reversement.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, mois, montant: 50_000, reverseLe: new Date(), reference: "WAVE-123" } });
    const bilan = await calculerBilan(a.org.id, proprio.id, mois);
    expect(bilan!.reversement?.reference).toBe("WAVE-123");
  });

  it("numérote les mandats par organisation et par année", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Numéros" } });
    const n1 = await prochainNumeroMandat(a.org.id, 2031);
    expect(n1).toBe("MG-2031-001");
    await db.mandat.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, numero: n1, commissionPct: 8, debutLe: new Date() } });
    expect(await prochainNumeroMandat(a.org.id, 2031)).toBe("MG-2031-002");
  });
});
