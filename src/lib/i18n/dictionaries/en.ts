import type { Dictionnaire } from "../translate";
import dict from "./en.json";

/** Dictionnaire anglais : clé = texte français, valeur = traduction. Complétude vérifiée par `npm run i18n:verifier`. */
export default dict as Dictionnaire;
