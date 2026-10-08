import type { Forfait } from "@prisma/client";

/** Grille validée : prix en FCFA/mois, quotas de logements et d'accès. */
export const FORFAITS: Record<Forfait, { nom: string; prix: number; logements: number; acces: number }> = {
  DECOUVERTE: { nom: "Découverte", prix: 0, logements: 15, acces: 1 },
  BAILLEUR: { nom: "Bailleur", prix: 10_000, logements: 15, acces: 1 },
  PRO: { nom: "Pro", prix: 25_000, logements: 50, acces: 5 },
  AGENCE: { nom: "Agence", prix: 25_000, logements: Infinity, acces: 15 },
};

const AGENCE_INCLUS = 50;
const AGENCE_PAR_LOGEMENT = 300;

/** Prix mensuel d'un abonnement pour un nombre de logements donné. */
export function prixMensuel(forfait: Forfait, nbLogements: number): number {
  if (forfait === "AGENCE") {
    return FORFAITS.AGENCE.prix + Math.max(0, nbLogements - AGENCE_INCLUS) * AGENCE_PAR_LOGEMENT;
  }
  return FORFAITS[forfait].prix;
}

/** Annuel = 10 mois payés pour 12. */
export const prixAnnuel = (forfait: Forfait, nbLogements: number) => prixMensuel(forfait, nbLogements) * 10;
