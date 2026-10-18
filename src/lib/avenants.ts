import { N_ } from "@/lib/i18n/translate";

/** Un avenant modifie un bail déjà signé : le loyer, la durée, ou une clause écrite. Ce module ne touche pas à la base. */
export type TypeAvenant = "LOYER" | "DUREE" | "CLAUSE";
export const TYPES_AVENANT: TypeAvenant[] = ["LOYER", "DUREE", "CLAUSE"];
export const LIBELLE_AVENANT: Record<TypeAvenant, string> = {
  LOYER: N_("Changement de loyer"),
  DUREE: N_("Prolongation ou changement de durée"),
  CLAUSE: N_("Autre clause"),
};

export const CLAUSE_MIN = 10;
export const CLAUSE_MAX = 1000;
const LOYER_MAX = 100_000_000;
const DUREE_MAX_ANNEES = 30;

export type EntreeAvenant = { type: string; effet?: string; loyer?: number; finLe?: string; clause?: string };
export type BailPourAvenant = { loyerMensuel: number; debutLe: Date; finLe: Date | null };
export type AvenantValide = {
  type: TypeAvenant;
  effetLe: Date;
  ancienLoyer: number | null;
  nouveauLoyer: number | null;
  ancienneFinLe: Date | null;
  nouvelleFinLe: Date | null;
  clause: string | null;
};
/** `erreur` est une phrase française à traduire par l'appelant (clé de dictionnaire). */
export type ResultatAvenant = { ok: true; avenant: AvenantValide } | { ok: false; erreur: string };

export const premierDuMois = (d: Date, decalage = 0) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + decalage, 1));

/** Date AAAA-MM-JJ stricte (jamais d'heure locale) ; null si invalide. */
export function dateStricte(v: string | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v ?? "");
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? d : null;
}

export function analyserAvenant(e: EntreeAvenant, bail: BailPourAvenant, now: Date): ResultatAvenant {
  const ceMois = premierDuMois(now);
  const base = { ancienLoyer: null, nouveauLoyer: null, ancienneFinLe: null, nouvelleFinLe: null, clause: null };

  if (e.type === "LOYER") {
    const loyer = Math.floor(Number(e.loyer));
    if (!Number.isFinite(loyer) || loyer <= 0) return { ok: false, erreur: N_("Indiquez le nouveau loyer mensuel.") };
    if (loyer > LOYER_MAX) return { ok: false, erreur: N_("Le nouveau loyer est trop élevé.") };
    if (loyer === bail.loyerMensuel) return { ok: false, erreur: N_("Le nouveau loyer est identique au loyer actuel.") };
    if (e.effet !== "courant" && e.effet !== "suivant") return { ok: false, erreur: N_("Choisissez le mois de prise d'effet.") };
    const effetLe = e.effet === "courant" ? ceMois : premierDuMois(now, 1);
    return { ok: true, avenant: { ...base, type: "LOYER", effetLe, ancienLoyer: bail.loyerMensuel, nouveauLoyer: loyer } };
  }

  if (e.type === "DUREE") {
    const fin = dateStricte(e.finLe);
    if (!fin) return { ok: false, erreur: N_("Indiquez la nouvelle date de fin du bail.") };
    if (fin <= bail.debutLe || fin < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))) {
      return { ok: false, erreur: N_("La nouvelle date de fin doit être postérieure à aujourd'hui et au début du bail.") };
    }
    if (fin.getUTCFullYear() > now.getUTCFullYear() + DUREE_MAX_ANNEES) return { ok: false, erreur: N_("La nouvelle date de fin est trop lointaine.") };
    if (bail.finLe && fin.getTime() === bail.finLe.getTime()) return { ok: false, erreur: N_("La nouvelle date de fin est identique à la date actuelle.") };
    return { ok: true, avenant: { ...base, type: "DUREE", effetLe: ceMois, ancienneFinLe: bail.finLe, nouvelleFinLe: fin } };
  }

  if (e.type === "CLAUSE") {
    const clause = (e.clause ?? "").replace(/\s+/g, " ").trim();
    if (clause.length < CLAUSE_MIN) return { ok: false, erreur: N_("Rédigez la clause (10 caractères au moins).") };
    if (clause.length > CLAUSE_MAX) return { ok: false, erreur: N_("La clause est trop longue (1 000 caractères au plus).") };
    return { ok: true, avenant: { ...base, type: "CLAUSE", effetLe: ceMois, clause } };
  }

  return { ok: false, erreur: N_("Choisissez le type d'avenant.") };
}
