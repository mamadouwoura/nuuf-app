import { cookies, headers } from "next/headers";
import { COOKIE_LANGUE, estLocale, localeDepuisEntete, type Locale } from "./config";
import { creerTraducteur, type Traducteur } from "./translate";
import en from "./dictionaries/en";
import clesClient from "./dictionaries/cles-client.json";

/** Langue de la requête : choix mémorisé (cookie), sinon langue du navigateur, sinon français. */
export async function getLocale(): Promise<Locale> {
  const choix = (await cookies()).get(COOKIE_LANGUE)?.value;
  if (estLocale(choix)) return choix;
  return localeDepuisEntete((await headers()).get("accept-language"));
}

export const dictionnaireDe = (locale: Locale) => (locale === "en" ? en : {});

/** Traducteur du composant serveur ou de l'action serveur courante. */
export async function getT(): Promise<Traducteur> {
  const locale = await getLocale();
  return creerTraducteur(locale, dictionnaireDe(locale));
}

/** Sous-ensemble du dictionnaire nécessaire aux composants client (évite d'embarquer tout le dictionnaire dans chaque page). */
export function dictionnaireClient(locale: Locale): Record<string, string> {
  const dict = dictionnaireDe(locale) as Record<string, string>;
  return Object.fromEntries((clesClient as string[]).filter((k) => k in dict).map((k) => [k, dict[k]]));
}
