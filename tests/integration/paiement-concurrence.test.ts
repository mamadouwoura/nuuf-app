import { afterAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { appliquerResultat } from "@/lib/passerelle";
import { purgerDonneesPeriodiques } from "@/lib/garde";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const organisations: string[] = [];
afterAll(async () => {
  for (const id of organisations) await supprimerOrganisation(id).catch(() => {});
  await db.tentativeConnexion.deleteMany({ where: { cle: { startsWith: "purge-test-" } } });
  await db.$disconnect();
});

describe.skipIf(!baseDeTest)("confirmation de paiement et ménage", () => {
  it("deux notifications simultanées de l'opérateur n'émettent qu'une seule quittance", async () => {
    const { org, echeance } = await creerOrganisation({ loyer: 80_000 });
    organisations.push(org.id);
    const reference = `SIM-${randomBytes(6).toString("hex").toUpperCase()}`;
    await db.paiement.create({ data: { echeanceId: echeance.id, montant: 80_000, canal: "WAVE", statut: "INITIE", referenceOperateur: reference } });

    const [a, b, c] = await Promise.all([
      appliquerResultat(reference, "CONFIRME"),
      appliquerResultat(reference, "CONFIRME"),
      appliquerResultat(reference, "CONFIRME"),
    ]);
    expect([a?.statut, b?.statut, c?.statut]).toEqual(["CONFIRME", "CONFIRME", "CONFIRME"]);
    expect(await db.quittance.count({ where: { organisationId: org.id } })).toBe(1);
    expect((await db.echeance.findUniqueOrThrow({ where: { id: echeance.id } })).statut).toBe("PAYEE");
  });

  it("un paiement déjà confirmé ne peut plus être annulé par un échec tardif", async () => {
    const { org, echeance } = await creerOrganisation();
    organisations.push(org.id);
    const reference = `SIM-${randomBytes(6).toString("hex").toUpperCase()}`;
    await db.paiement.create({ data: { echeanceId: echeance.id, montant: 100_000, canal: "ORANGE_MONEY", statut: "INITIE", referenceOperateur: reference } });
    await appliquerResultat(reference, "CONFIRME");
    const r = await appliquerResultat(reference, "ECHEC");
    expect(r?.statut).toBe("CONFIRME");
    expect((await db.paiement.findUniqueOrThrow({ where: { referenceOperateur: reference } })).statut).toBe("CONFIRME");
  });

  it("le ménage retire les échecs de connexion anciens et garde les récents", async () => {
    const vieux = new Date(Date.now() - 3 * 86_400_000);
    await db.tentativeConnexion.create({ data: { cle: "purge-test-ancien", creeLe: vieux } });
    await db.tentativeConnexion.create({ data: { cle: "purge-test-recent" } });
    const bilan = await purgerDonneesPeriodiques();
    expect(bilan.tentatives).toBeGreaterThanOrEqual(1);
    expect(await db.tentativeConnexion.count({ where: { cle: "purge-test-ancien" } })).toBe(0);
    expect(await db.tentativeConnexion.count({ where: { cle: "purge-test-recent" } })).toBe(1);
  });
});
