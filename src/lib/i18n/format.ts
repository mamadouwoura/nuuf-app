import { localeIntl, type Locale } from "./config";

const MOIS: Record<Locale, string[]> = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MOIS_COURTS: Record<Locale, string[]> = {
  fr: ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** Nom du mois (UTC), avec majuscule initiale en option. */
export const nomMois = (d: Date, locale: Locale, majuscule = false) => {
  const m = MOIS[locale][d.getUTCMonth()];
  return majuscule ? m.charAt(0).toUpperCase() + m.slice(1) : m;
};
export const moisCourt = (d: Date, locale: Locale) => MOIS_COURTS[locale][d.getUTCMonth()];
export const moisAnnee = (d: Date, locale: Locale) => `${nomMois(d, locale, true)} ${d.getUTCFullYear()}`;

/** Date formatée dans la langue de l'utilisateur. */
export const formaterDate = (d: Date, locale: Locale, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" }) =>
  new Intl.DateTimeFormat(localeIntl(locale), options).format(d);
