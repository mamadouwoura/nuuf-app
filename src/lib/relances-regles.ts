import { N_ } from "@/lib/i18n/translate";

/**
 * Règles de relance : pures, sans base de données.
 * Une règle = un décalage en jours par rapport à l'échéance (négatif = avant, 0 = le jour même, positif = après).
 */
export const JOURS_MIN = -30;
export const JOURS_MAX = 60;
export const MAX_REGLES = 8;
export const REGLES_PAR_DEFAUT = [-3, 1, 5];
export const HEURE_PAR_DEFAUT = 9; // heure de Dakar (GMT)

/** Nom de la relance, conservé tel quel dans l'historique : J-3, J+0, J+1, J+5… */
export const declencheurPour = (jours: number) => (jours < 0 ? `J${jours}` : `J+${jours}`);

/** Garde les décalages valides, sans doublon, du plus lointain avant l'échéance au plus tardif. */
export function reglesValides(liste: number[]): number[] {
  const ok = liste.filter((j) => Number.isInteger(j) && j >= JOURS_MIN && j <= JOURS_MAX);
  return [...new Set(ok)].sort((a, b) => a - b).slice(0, MAX_REGLES);
}

/**
 * Quelle règle s'applique à un loyer dont l'échéance est `jours` jours derrière nous (négatif = pas encore échu) ?
 * Une règle reste valable jusqu'à la suivante ; une règle « avant échéance » ne l'est jamais après la date limite.
 * Ainsi, un loyer très en retard ne reçoit qu'un seul message (la règle la plus récente), jamais toute la série d'un coup.
 */
export function regleApplicable(jours: number, regles: number[]): number | null {
  const tri = reglesValides(regles);
  let choisie: number | null = null;
  for (const d of tri) if (d <= jours) choisie = d;
  if (choisie === null) return null;
  if (choisie < 0 && jours >= 0) return null;
  return choisie;
}

export type SensRegle = "avant" | "jour" | "apres";
export const versJours = (sens: SensRegle, nombre: number) => (sens === "avant" ? -nombre : sens === "apres" ? nombre : 0);
export const decoupeJours = (jours: number): { sens: SensRegle; nombre: number } => (jours < 0 ? { sens: "avant", nombre: -jours } : jours === 0 ? { sens: "jour", nombre: 0 } : { sens: "apres", nombre: jours });

/** Libellé court (clé de dictionnaire) pour une règle. */
export const LIBELLE_SENS: Record<SensRegle, string> = {
  avant: N_("{n} jour(s) avant l'échéance"),
  jour: N_("Le jour de l'échéance"),
  apres: N_("{n} jour(s) après l'échéance"),
};

/* ----------------------------- Modèles de message ----------------------------- */

export const VARIABLES = ["prenom", "nom", "montant", "bien", "mois", "echeance", "jours", "lien"] as const;
export type Variable = (typeof VARIABLES)[number];

export const MODELE_AVANT_DEFAUT = "Bonjour {prenom}, votre loyer de {bien} ({montant}) arrive à échéance bientôt. Réglez-le en un clic (Wave ou Orange Money) : {lien}";
export const MODELE_RETARD_DEFAUT = "Bonjour {prenom}, le loyer de {bien} ({montant}) est arrivé à échéance. Vous pouvez le régler en un clic (Wave ou Orange Money) : {lien}";

export const MODELE_MIN = 15;
export const MODELE_MAX = 600;

/** Exemple affiché dans l'aperçu : aucune donnée réelle. */
export const EXEMPLE: Record<Variable, string> = {
  prenom: "Awa",
  nom: "Awa Diallo",
  montant: "150 000 FCFA",
  bien: "Appartement F3 Ouakam",
  mois: "octobre 2026",
  echeance: "05/10/2026",
  jours: "3",
  lien: "https://nuuf.sn/payer/F7K2",
};

export type ResultatModele = { ok: true; texte: string | null } | { ok: false; erreur: string };

/** Valide un modèle saisi : vide = modèle par défaut ; sinon longueur raisonnable et variables connues seulement. */
export function validerModele(brut: string): ResultatModele {
  const texte = brut.replace(/\r\n/g, "\n").replace(/[^\S\n]+/g, " ").trim();
  if (!texte) return { ok: true, texte: null };
  if (texte.length < MODELE_MIN) return { ok: false, erreur: N_("Le message de relance est trop court (15 caractères au moins).") };
  if (texte.length > MODELE_MAX) return { ok: false, erreur: N_("Le message de relance est trop long (600 caractères au plus).") };
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(texte)) return { ok: false, erreur: N_("Le message de relance contient des caractères non autorisés.") };
  for (const m of texte.matchAll(/\{([^{}]*)\}/g)) {
    if (!(VARIABLES as readonly string[]).includes(m[1])) return { ok: false, erreur: N_("Le message contient une variable inconnue.") };
  }
  if (/[{}]/.test(texte.replace(/\{[^{}]*\}/g, ""))) return { ok: false, erreur: N_("Le message contient une accolade mal fermée.") };
  return { ok: true, texte };
}

/** Remplace les variables {prenom}, {montant}… par leurs valeurs. Une variable inconnue reste telle quelle. */
export function remplirModele(modele: string, valeurs: Partial<Record<Variable, string>>): string {
  return modele.replace(/\{([a-z]+)\}/g, (tout, nom: string) => (nom in valeurs ? (valeurs[nom as Variable] ?? "") : tout));
}

/** Modèle à utiliser : avant ou le jour de l'échéance → « avant » ; après → « retard ». */
export function modelePour(jours: number, p: { modeleAvant?: string | null; modeleRetard?: string | null }): string {
  return jours <= 0 ? (p.modeleAvant ?? MODELE_AVANT_DEFAUT) : (p.modeleRetard ?? MODELE_RETARD_DEFAUT);
}
