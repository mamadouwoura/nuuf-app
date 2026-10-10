import { N_ } from "./i18n/translate";

/** Motifs de fin de location : volontairement neutres (les impayés ressortent des chiffres, pas d'une étiquette). */
export const MOTIFS_FIN = [
  { code: "FIN_NORMALE", libelle: N_("Fin normale du contrat") },
  { code: "DEPART_LOCATAIRE", libelle: N_("Départ à l'initiative du locataire") },
  { code: "FIN_BAILLEUR", libelle: N_("Fin décidée par le bailleur") },
  { code: "AUTRE", libelle: N_("Autre motif") },
] as const;
export const motifValide = (v: string) => MOTIFS_FIN.some((m) => m.code === v);

/**
 * Appréciation du bailleur à la fin de la location : quatre questions à réponses fermées (aucun texte libre),
 * pour rester comparable, vérifiable et défendable.
 */
export const APPRECIATION = {
  logement: {
    colonne: "apprLogement",
    titre: N_("Respect du logement"),
    options: [
      { code: "SOIGNE", libelle: N_("Bien soigné") },
      { code: "CORRECT", libelle: N_("Correct") },
      { code: "DEGRADE", libelle: N_("Dégradé") },
    ],
  },
  regles: {
    colonne: "apprRegles",
    titre: N_("Respect des règles du contrat et du voisinage"),
    options: [
      { code: "BON", libelle: N_("Bon") },
      { code: "A_SURVEILLER", libelle: N_("À surveiller") },
      { code: "PROBLEMATIQUE", libelle: N_("Problématique") },
    ],
  },
  sortie: {
    colonne: "apprSortie",
    titre: N_("État du logement à la sortie"),
    options: [
      { code: "BON_ETAT", libelle: N_("Bon état") },
      { code: "USURE_NORMALE", libelle: N_("Usure normale") },
      { code: "DEGRADATIONS", libelle: N_("Dégradations constatées") },
    ],
  },
  relouer: {
    colonne: "apprRelouer",
    titre: N_("Reloueriez-vous à ce locataire ?"),
    options: [
      { code: "OUI", libelle: N_("Oui") },
      { code: "RESERVE", libelle: N_("Avec réserve") },
      { code: "NON", libelle: N_("Non") },
    ],
  },
} as const;

export type CleAppreciation = keyof typeof APPRECIATION;
export const CLES_APPRECIATION = Object.keys(APPRECIATION) as CleAppreciation[];

export type Appreciation = { logement: string | null; regles: string | null; sortie: string | null; relouer: string | null };

const valide = (cle: CleAppreciation, v: string) => APPRECIATION[cle].options.some((o) => o.code === v);

/** Lit les quatre champs `appr_*` d'un formulaire ; toute valeur hors liste devient « non renseigné ». */
export function lireAppreciation(lire: (nom: string) => string): Appreciation {
  const sortie = {} as Appreciation;
  for (const cle of CLES_APPRECIATION) {
    const v = lire(`appr_${cle}`).trim();
    sortie[cle] = valide(cle, v) ? v : null;
  }
  return sortie;
}

/** Libellé (à traduire) d'une valeur d'appréciation, ou null. */
export function libelleAppreciation(cle: CleAppreciation, code: string | null): string | null {
  return APPRECIATION[cle].options.find((o) => o.code === code)?.libelle ?? null;
}
