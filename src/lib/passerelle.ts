import { randomBytes } from "node:crypto";
import { db } from "./db";
import { solderEtQuittancer } from "./encaissement";
import { finApresPaiement } from "./abonnement";

/**
 * Passerelle Wave / Orange Money.
 * Mode « simulation » (défaut) : aucune API réelle n'est appelée ; une page de test permet de
 * valider ou refuser le paiement. Le mode « reel » sera branché sur les API Wave et Orange Money
 * (initiation + webhook signé) dès réception des accès marchands.
 */
/**
 * La simulation est le défaut en développement uniquement. En production il faut la demander
 * explicitement (PAIEMENT_MODE="simulation", pour une démo) : sans cela, aucun paiement ne peut
 * être « validé à la main ».
 */
export const modeSimulation = () => {
  const mode = process.env.PAIEMENT_MODE;
  return mode ? mode === "simulation" : process.env.NODE_ENV !== "production";
};

export type Canal = "WAVE" | "ORANGE_MONEY";

export async function initierTransaction(_demande: { canal: Canal; montant: number; telephone: string }) {
  if (!modeSimulation()) {
    throw new Error("Passerelle réelle non configurée : renseignez les accès Wave / Orange Money.");
  }
  const reference = `SIM-${randomBytes(6).toString("hex").toUpperCase()}`;
  return { reference, urlSuite: `/paiement/simulation/${reference}` };
}

/** Applique le résultat d'une transaction (webhook opérateur ou simulation). Idempotent. */
export async function appliquerResultat(reference: string, statut: "CONFIRME" | "ECHEC") {
  const paiement = await db.paiement.findUnique({
    where: { referenceOperateur: reference },
    include: { echeance: { include: { bail: { include: { bien: true } } } } },
  });
  if (!paiement) return appliquerResultatAbonnement(reference, statut);
  const jeton = paiement.echeance.jetonPaiement;
  if (paiement.statut !== "INITIE") return { jeton, paiementId: paiement.id, statut: paiement.statut };

  if (statut === "ECHEC") {
    await db.paiement.updateMany({ where: { id: paiement.id, statut: "INITIE" }, data: { statut: "ECHEC" } });
    const actuel = await db.paiement.findUnique({ where: { id: paiement.id }, select: { statut: true } });
    return { jeton, paiementId: paiement.id, statut: actuel?.statut ?? ("ECHEC" as const) };
  }
  // Le passage INITIE -> CONFIRME est réservé en une seule opération : si deux notifications arrivent en même
  // temps, une seule gagne et émet la quittance (l'autre ne trouve plus le paiement à l'état INITIE).
  await db.$transaction(async (tx) => {
    const reserve = await tx.paiement.updateMany({ where: { id: paiement.id, statut: "INITIE" }, data: { statut: "CONFIRME", recuLe: new Date() } });
    if (reserve.count === 0) return;
    await solderEtQuittancer(tx, {
      organisationId: paiement.echeance.bail.bien.organisationId,
      echeanceId: paiement.echeanceId,
      paiementId: paiement.id,
    });
  });
  const final = await db.paiement.findUnique({ where: { id: paiement.id }, select: { statut: true } });
  return { jeton, paiementId: paiement.id, statut: final?.statut ?? ("CONFIRME" as const) };
}

/** Paiement d'abonnement Nuuf : active ou prolonge le forfait choisi. */
async function appliquerResultatAbonnement(reference: string, statut: "CONFIRME" | "ECHEC") {
  const f = await db.factureAbonnement.findUnique({ where: { referenceOperateur: reference }, include: { abonnement: true } });
  if (!f) return null;
  const dejaPayee = Boolean(f.payeeLe);
  if (statut === "CONFIRME" && !dejaPayee) {
    const fin = finApresPaiement(f.abonnement, f);
    // La facture n'est marquée payée qu'une fois : une seconde notification simultanée ne prolonge pas deux fois l'abonnement.
    await db.$transaction(async (tx) => {
      const reserve = await tx.factureAbonnement.updateMany({ where: { id: f.id, payeeLe: null }, data: { payeeLe: new Date(), periodeFin: fin } });
      if (reserve.count === 0) return;
      await tx.abonnement.update({
        where: { id: f.abonnementId },
        data: { forfait: f.forfait, annuel: f.annuel, statut: "ACTIF", periodeFinLe: fin, essaiFinLe: null, graceFinLe: null },
      });
    });
  }
  return { jeton: null, paiementId: f.id, statut: statut === "CONFIRME" || dejaPayee ? ("CONFIRME" as const) : ("ECHEC" as const), abonnement: true as const };
}
