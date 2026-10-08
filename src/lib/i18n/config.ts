/** Langues de l'interface. Le français est la langue source : ses textes servent de clés, aucun dictionnaire n'est chargé pour lui. */
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_PAR_DEFAUT: Locale = "fr";
export const COOKIE_LANGUE = "nuuf_lang";

export const estLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Choix d'après l'en-tête Accept-Language (première langue reconnue, sinon français). */
export function localeDepuisEntete(accept: string | null | undefined): Locale {
  for (const part of (accept ?? "").split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return LOCALE_PAR_DEFAUT;
}

/** Locale Intl correspondante, pour les dates et les nombres. */
export const localeIntl = (l: Locale) => (l === "en" ? "en-GB" : "fr-FR");
