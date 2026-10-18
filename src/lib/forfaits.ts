import type { Forfait } from "@prisma/client";
import { N_ } from "@/lib/i18n/translate";

/** Grille validée : prix en FCFA/mois, quotas de logements et d'accès. */
export const FORFAITS: Record<Forfait, { nom: string; prix: number; logements: number; acces: number }> = {
  DECOUVERTE: { nom: N_("Découverte"), prix: 0, logements: 15, acces: 1 },
  BAILLEUR: { nom: N_("Bailleur"), prix: 9_900, logements: 15, acces: 1 },
  PRO: { nom: "Pro", prix: 24_900, logements: 50, acces: 5 },
  AGENCE: { nom: N_("Agence"), prix: 24_900, logements: Infinity, acces: 15 },
};

const AGENCE_INCLUS = 50;
const AGENCE_PAR_LOGEMENT = 300;
/** Palier d'entrée : les petites agences (jusqu'à 20 logements) paient 14 900 FCFA. */
export const AGENCE_PALIER_ENTREE = { logements: 20, prix: 14_900 } as const;

/** Prix mensuel d'un abonnement pour un nombre de logements donné. */
export function prixMensuel(forfait: Forfait, nbLogements: number): number {
  if (forfait === "AGENCE") {
    if (nbLogements <= AGENCE_PALIER_ENTREE.logements) return AGENCE_PALIER_ENTREE.prix;
    return FORFAITS.AGENCE.prix + Math.max(0, nbLogements - AGENCE_INCLUS) * AGENCE_PAR_LOGEMENT;
  }
  return FORFAITS[forfait].prix;
}

/** Annuel = 10 mois payés pour 12. */
export const prixAnnuel = (forfait: Forfait, nbLogements: number) => prixMensuel(forfait, nbLogements) * 10;
