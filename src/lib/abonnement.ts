import type { Abonnement } from "@prisma/client";
import { FORFAITS, prixAnnuel, prixMensuel } from "./forfaits";

const JOUR = 86_400_000;
export const JOURS_GRACE = 7;

export type EtatAcces = {
  /** Écriture autorisée (ajout de biens, encaissements...). Faux = lecture seule. */
  ecriture: boolean;
  etat: "ESSAI" | "ACTIF" | "GRACE" | "ESSAI_TERMINE" | "LECTURE_SEULE";
  /** Jours restants de l'essai ou de la période de grâce, selon l'état. */
  joursRestants: number | null;
  finLe: Date | null;
};

/** État d'accès calculé à la volée à partir de l'abonnement (rien n'est persisté). */
export function etatAcces(a: Abonnement | null | undefined, now = new Date()): EtatAcces {
  if (!a) return { ecriture: false, etat: "LECTURE_SEULE", joursRestants: null, finLe: null };
  const jours = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / JOUR));
  if (a.statut === "ESSAI") {
    if (a.essaiFinLe && a.essaiFinLe >= now) return { ecriture: true, etat: "ESSAI", joursRestants: jours(a.essaiFinLe), finLe: a.essaiFinLe };
    return { ecriture: false, etat: "ESSAI_TERMINE", joursRestants: 0, finLe: a.essaiFinLe };
  }
  if (a.statut === "RESILIE") {
    // Résilié : l'accès continue jusqu'à la fin de la période déjà payée.
    return a.periodeFinLe && a.periodeFinLe >= now
      ? { ecriture: true, etat: "ACTIF", joursRestants: jours(a.periodeFinLe), finLe: a.periodeFinLe }
      : { ecriture: false, etat: "LECTURE_SEULE", joursRestants: null, finLe: a.periodeFinLe };
  }
  const fin = a.periodeFinLe;
  if (!fin || fin >= now) return { ecriture: true, etat: "ACTIF", joursRestants: fin ? jours(fin) : null, finLe: fin };
  const grace = new Date(fin.getTime() + JOURS_GRACE * JOUR);
  if (grace >= now) return { ecriture: true, etat: "GRACE", joursRestants: jours(grace), finLe: grace };
  return { ecriture: false, etat: "LECTURE_SEULE", joursRestants: 0, finLe: grace };
}

export const limiteLogements = (a: Pick<Abonnement, "forfait"> | null | undefined) =>
  FORFAITS[a?.forfait ?? "DECOUVERTE"].logements;

/** Nouvelle fin de période après un paiement : prolonge depuis la fin actuelle si elle n'est pas dépassée. */
export function prolonger(a: Pick<Abonnement, "periodeFinLe">, annuel: boolean, now = new Date()) {
  const depart = a.periodeFinLe && a.periodeFinLe > now ? a.periodeFinLe : now;
  const fin = new Date(depart);
  fin.setUTCMonth(fin.getUTCMonth() + (annuel ? 12 : 1));
  return fin;
}

/**
 * Fin de période après le paiement d'une facture.
 * - Même forfait et même périodicité : on prolonge à partir de la fin actuelle (renouvellement).
 * - Changement de forfait ou de périodicité : la nouvelle période démarre aujourd'hui, et le temps
 *   restant déjà payé est converti en jours du nouveau forfait au prorata des prix (aucune perte).
 */
export function finApresPaiement(
  a: Pick<Abonnement, "forfait" | "annuel" | "statut" | "periodeFinLe">,
  f: { forfait: Abonnement["forfait"]; annuel: boolean; nbLogements: number },
  now = new Date(),
) {
  if (a.statut !== "ESSAI" && a.forfait === f.forfait && a.annuel === f.annuel) return prolonger(a, f.annuel, now);

  const fin = new Date(now);
  fin.setUTCMonth(fin.getUTCMonth() + (f.annuel ? 12 : 1));
  if (a.statut !== "ESSAI" && a.periodeFinLe && a.periodeFinLe > now) {
    const mensuel = (forfait: Abonnement["forfait"], annuel: boolean) =>
      annuel ? prixAnnuel(forfait, f.nbLogements) / 12 : prixMensuel(forfait, f.nbLogements);
    const ancien = mensuel(a.forfait, a.annuel);
    const nouveau = mensuel(f.forfait, f.annuel);
    if (nouveau > 0) {
      const restantMs = a.periodeFinLe.getTime() - now.getTime();
      return new Date(fin.getTime() + restantMs * (ancien / nouveau));
    }
  }
  return fin;
}
