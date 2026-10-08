import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { lancerRelancesAutomatiques } from "@/lib/relances-auto";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id);
  await db.$disconnect();
});

const relancesDe = (echeanceId: string) => db.relance.findMany({ where: { echeanceId } });

describe.skipIf(!baseDeTest)("relances automatiques", () => {
  it("envoie le rappel J+1 une seule fois, même si le planificateur repasse", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques();
    await lancerRelancesAutomatiques();
    const r = await relancesDe(a.echeance.id);
    expect(r.map((x) => x.declencheur)).toEqual(["J+1"]);
    const messages = await db.message.count({ where: { organisationId: a.org.id, type: "RELANCE" } });
    expect(messages).toBe(1);
  });

  it("envoie le rappel J-3 avant l'échéance", async () => {
    const a = await creerOrganisation({ jourDeLimite: 2 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques();
    expect((await relancesDe(a.echeance.id)).map((x) => x.declencheur)).toEqual(["J-3"]);
  });

  it("n'envoie rien si le loyer est déjà soldé", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await db.paiement.create({ data: { echeanceId: a.echeance.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME" } });
    await db.echeance.update({ where: { id: a.echeance.id }, data: { statut: "PAYEE" } });
    await lancerRelancesAutomatiques();
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });

  it("respecte les réglages désactivés par le bailleur", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2 });
    orgs.push(a.org.id);
    await db.parametresRelance.create({ data: { organisationId: a.org.id, avantEcheance: true, apresJ1: false, apresJ5: true } });
    await lancerRelancesAutomatiques();
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });

  it("n'envoie rien aux comptes en lecture seule (abonnement expiré)", async () => {
    const a = await creerOrganisation({ jourDeLimite: -2, periodeFinJours: -30 });
    orgs.push(a.org.id);
    await lancerRelancesAutomatiques();
    expect(await relancesDe(a.echeance.id)).toHaveLength(0);
  });
});
