import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { solderEtQuittancer } from "@/lib/encaissement";
import { loyersDuMois } from "@/lib/loyers";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id);
  await db.$disconnect();
});

async function encaisser(orgId: string, echeanceId: string, montant: number) {
  return db.$transaction(async (tx) => {
    const p = await tx.paiement.create({ data: { echeanceId, montant, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    return solderEtQuittancer(tx, { organisationId: orgId, echeanceId, paiementId: p.id });
  });
}

describe.skipIf(!baseDeTest)("encaissement et quittances", () => {
  it("numérote sans doublon quand plusieurs paiements arrivent en même temps", async () => {
    const a = await creerOrganisation({ loyer: 500_000 });
    orgs.push(a.org.id);
    const quittances = await Promise.all([1, 2, 3, 4, 5].map(() => encaisser(a.org.id, a.echeance.id, 10_000)));
    const numeros = quittances.map((q) => q.numero).sort();
    expect(new Set(numeros).size).toBe(5);
    expect(numeros.map((n) => Number(n.slice(-3)))).toEqual([1, 2, 3, 4, 5]);
  });

  it("la numérotation est indépendante entre organisations", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const qa = await encaisser(a.org.id, a.echeance.id, 40_000);
    const qb = await encaisser(b.org.id, b.echeance.id, 40_000);
    expect(qa.numero.endsWith("-001")).toBe(true);
    expect(qb.numero.endsWith("-001")).toBe(true);
  });

  it("l'échéance passe à PARTIELLE puis PAYEE", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    await encaisser(a.org.id, a.echeance.id, 40_000);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: a.echeance.id } })).statut).toBe("PARTIELLE");
    await encaisser(a.org.id, a.echeance.id, 60_000);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: a.echeance.id } })).statut).toBe("PAYEE");
  });
});

describe.skipIf(!baseDeTest)("cloisonnement entre organisations", () => {
  it("les loyers d'un bailleur n'apparaissent jamais chez un autre", async () => {
    const a = await creerOrganisation({ loyer: 123_000 });
    const b = await creerOrganisation({ loyer: 456_000 });
    orgs.push(a.org.id, b.org.id);
    const mois = a.echeance.mois;
    const chezA = await loyersDuMois(a.org.id, mois, new Date());
    const chezB = await loyersDuMois(b.org.id, mois, new Date());
    expect(chezA.lignes.map((l) => l.id)).toEqual([a.echeance.id]);
    expect(chezB.lignes.map((l) => l.id)).toEqual([b.echeance.id]);
    expect(chezA.attendu).toBe(123_000);
    expect(chezB.attendu).toBe(456_000);
  });
});
