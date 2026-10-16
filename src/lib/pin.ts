/** Règles du code PIN de verrouillage. Le PIN protège un téléphone laissé ouvert ; il ne remplace pas le mot de passe ni le code reçu par SMS. */

/** Délais de verrouillage proposés (minutes d'inactivité). */
export const DELAIS_VERROUILLAGE = [1, 5, 10, 30] as const;

export const MAX_ECHECS_PIN = 5;
export const FENETRE_PIN_MS = 15 * 60_000;

export type ProblemePin = "format" | "faible" | null;

/** 4 à 6 chiffres, sans suite évidente (1234, 4321…) ni chiffre répété (0000). */
export function problemePin(pin: string): ProblemePin {
  if (!/^\d{4,6}$/.test(pin)) return "format";
  if (/^(\d)\1+$/.test(pin)) return "faible";
  const chiffres = [...pin].map(Number);
  const pas = chiffres.slice(1).map((c, i) => c - chiffres[i]);
  if (pas.every((p) => p === 1) || pas.every((p) => p === -1)) return "faible";
  return null;
}

type Verrouillable = { pinHash: string | null; verrouillageMin: number };

/** Une session est verrouillée quand l'utilisateur a un PIN et que son dernier passage date de plus que le délai choisi. */
export function estVerrouillee(u: Verrouillable, activiteLe: Date, now = new Date()) {
  if (!u.pinHash) return false;
  const delai = (DELAIS_VERROUILLAGE as readonly number[]).includes(u.verrouillageMin) ? u.verrouillageMin : 10;
  return now.getTime() - activiteLe.getTime() > delai * 60_000;
}

/** L'activité n'est réécrite qu'une fois par minute au plus : pas d'écriture à chaque clic. */
export const ACTIVITE_RAFRAICHIE_MS = 60_000;
