import type { Locale } from "./config";

export type Dictionnaire = Record<string, string>;
export type Variables = Record<string, string | number>;
export type Traducteur = {
  locale: Locale;
  /** Traduit un texte français ; `{nom}` est remplacé par la variable correspondante. Texte inconnu : renvoyé tel quel. */
  t: (texte: string, vars?: Variables) => string;
  /** Pluriel : `un` pour 0 et 1 en français, pour 1 seulement en anglais ; `{n}` reçoit le nombre. */
  tn: (nombre: number, un: string, plusieurs: string, vars?: Variables) => string;
};

/** Marqueur d'extraction : renvoie le texte inchangé (pour les textes définis hors composant, traduits à l'affichage). */
export const N_ = <T extends string>(texte: T): T => texte;

function interpoler(texte: string, vars?: Variables) {
  return vars ? texte.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : texte;
}

export function creerTraducteur(locale: Locale, dict: Dictionnaire = {}): Traducteur {
  const t = (texte: string, vars?: Variables) => interpoler(locale === "fr" ? texte : (dict[texte] ?? texte), vars);
  const tn = (nombre: number, un: string, plusieurs: string, vars?: Variables) => {
    const singulier = locale === "en" ? nombre === 1 : nombre <= 1;
    return t(singulier ? un : plusieurs, { n: nombre, ...vars });
  };
  return { locale, t, tn };
}
