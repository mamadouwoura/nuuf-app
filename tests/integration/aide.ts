import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

/** Les tests d'intégration exigent une base dédiée (DATABASE_URL_TEST), jamais la base de développement. */
export const baseDeTest = Boolean(process.env.DATABASE_URL_TEST);

const JOUR = 86_400_000;

/** Crée une organisation complète : abonnement, un bien, un locataire, un bail et une échéance. */
export async function creerOrganisation(opts: { statutAbo?: "ACTIF" | "ESSAI"; periodeFinJours?: number; jourDeLimite?: number; loyer?: number } = {}) {
  const id = randomBytes(5).toString("hex");
  const now = new Date();
  const org = await db.organisation.create({
    data: {
      nom: `Org test ${id}`,
      abonnement: {
        create: {
          forfait: "PRO",
          statut: opts.statutAbo ?? "ACTIF",
          periodeFinLe: new Date(now.getTime() + (opts.periodeFinJours ?? 20) * JOUR),
          essaiFinLe: new Date(now.getTime() + 10 * JOUR),
        },
      },
    },
  });
  const bien = await db.bien.create({
    data: { organisationId: org.id, designation: `Bien ${id}`, type: "APPARTEMENT", quartier: "Almadies", ville: "Dakar" },
  });
  const locataire = await db.locataire.create({
    data: { organisationId: org.id, nomComplet: `Locataire ${id}`, telephone: "+221770000000" },
  });
  const bail = await db.bail.create({
    data: { bienId: bien.id, locataireId: locataire.id, loyerMensuel: opts.loyer ?? 100_000, jourEcheance: 5, debutLe: new Date(now.getTime() - 90 * JOUR) },
  });
  const mois = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const dateLimite = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + (opts.jourDeLimite ?? 0) * JOUR);
  const echeance = await db.echeance.create({
    data: { bailId: bail.id, mois, montantDu: opts.loyer ?? 100_000, dateLimite },
  });
  return { org, bien, locataire, bail, echeance };
}

export async function supprimerOrganisation(orgId: string) {
  await db.organisation.delete({ where: { id: orgId } });
}
