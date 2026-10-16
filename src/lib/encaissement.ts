import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { appUrl } from "./quittance";
import { notifier } from "./notifications";
import { N_ } from "./i18n/translate";

/**
 * Appelée dès qu'un paiement passe à CONFIRME (espèces, simulation ou webhook opérateur) :
 * met à jour le statut de l'échéance et émet la quittance numérotée.
 */
export async function solderEtQuittancer(
  tx: Prisma.TransactionClient,
  p: { organisationId: string; echeanceId: string; paiementId: string; acteurId?: string },
) {
  // Sérialise la numérotation des quittances d'une même organisation (pas de doublon sous charge).
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${p.organisationId}))`;
  const echeance = await tx.echeance.findUniqueOrThrow({
    where: { id: p.echeanceId },
    include: { paiements: { where: { statut: "CONFIRME" } } },
  });
  const paye = echeance.paiements.reduce((s, x) => s + x.montant, 0);
  await tx.echeance.update({
    where: { id: p.echeanceId },
    data: { statut: paye >= echeance.montantDu ? "PAYEE" : "PARTIELLE" },
  });

  // Numéro séquentiel par organisation et par mois : Q-2026-10-001
  const now = new Date();
  const prefixe = `Q-${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-`;
  // Dernier numéro émis ce mois-ci + 1 (et non un simple comptage : une quittance supprimée ferait réutiliser un numéro).
  const dernier = await tx.quittance.findFirst({ where: { organisationId: p.organisationId, numero: { startsWith: prefixe } }, orderBy: { numero: "desc" }, select: { numero: true } });
  const n = dernier ? Number(dernier.numero.slice(prefixe.length)) || 0 : 0;
  const quittance = await tx.quittance.create({
    data: {
      organisationId: p.organisationId,
      paiementId: p.paiementId,
      numero: `${prefixe}${String(n + 1).padStart(3, "0")}`,
      jetonQr: randomBytes(16).toString("hex"),
    },
  });
  const [bail, paiement] = await Promise.all([
    tx.bail.findUniqueOrThrow({ where: { id: echeance.bailId }, include: { locataire: { select: { nomComplet: true } }, bien: { select: { designation: true } } } }),
    tx.paiement.findUniqueOrThrow({ where: { id: p.paiementId }, select: { montant: true } }),
  ]);
  await notifier(tx, {
    organisationId: p.organisationId,
    categorie: "PAIEMENTS",
    titre: N_("Paiement reçu"),
    texte: N_("{locataire} a payé {montant} FCFA ({bien})."),
    donnees: { locataire: bail.locataire.nomComplet, montant: String(paiement.montant).replace(/\B(?=(\d{3})+(?!\d))/g, " "), bien: bail.bien.designation },
    lien: `/quittances`,
    sauf: p.acteurId,
  });
  return quittance;
}

/** Lien de paiement locataire (valable 72 h) : le renouvelle s'il a expiré. */
export async function lienPaiement(echeanceId: string) {
  const e = await db.echeance.findUniqueOrThrow({ where: { id: echeanceId } });
  let jeton = e.jetonPaiement;
  if (!jeton || !e.jetonExpireLe || e.jetonExpireLe < new Date()) {
    jeton = randomBytes(16).toString("hex");
    await db.echeance.update({
      where: { id: echeanceId },
      data: { jetonPaiement: jeton, jetonExpireLe: new Date(Date.now() + 72 * 3_600_000) },
    });
  }
  return `${appUrl()}/paiement/${jeton}`;
}
