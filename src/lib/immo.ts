import type { StatutEcheance, TypeBien } from "@prisma/client";
import { N_ } from "@/lib/i18n/translate";

export const TYPE_LIBELLE: Record<TypeBien, string> = {
  APPARTEMENT: N_("Appartement"),
  VILLA: N_("Villa"),
  STUDIO: N_("Studio"),
  COMMERCIAL: N_("Commercial"),
};

export type StatutLoyer =
  | { code: "VACANT"; libelle: string }
  | { code: "PAYE"; libelle: string }
  | { code: "EN_RETARD"; libelle: string; jours: number }
  | { code: "EN_ATTENTE"; libelle: string }
  | { code: "PARTIEL"; libelle: string };

const JOUR = 86_400_000;

/** Statut du loyer d'un bail pour son échéance la plus récente. */
export function statutLoyer(
  echeance: { statut: StatutEcheance; dateLimite: Date } | undefined | null,
  now: Date,
): StatutLoyer {
  if (!echeance) return { code: "VACANT", libelle: N_("Vacant") };
  if (echeance.statut === "PAYEE") return { code: "PAYE", libelle: N_("Payé") };
  if (echeance.statut === "PARTIELLE") return { code: "PARTIEL", libelle: N_("Partiel") };
  const jours = Math.floor((now.getTime() - echeance.dateLimite.getTime()) / JOUR);
  if (jours > 0) return { code: "EN_RETARD", libelle: N_("En retard (+{n}j)"), jours };
  return { code: "EN_ATTENTE", libelle: N_("En attente") };
}

export const fcfa = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const initiales = (nom: string) =>
  nom.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/** Masque le dessus du numéro : +221 77 412 •••• */
export function telMasque(tel: string) {
  return tel.replace(/^\+221(\d{2})(\d{3})(\d{4})$/, "+221 $1 $2 ••••");
}

/** +221771234567 -> +221 77 123 45 67 */
export function telAffiche(tel: string) {
  return tel.replace(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/, "+221 $1 $2 $3 $4");
}

/** Texte affiché d'un statut de loyer, dans la langue de l'utilisateur. */
export const libelleStatut = (st: StatutLoyer, t: (texte: string, vars?: Record<string, string | number>) => string) =>
  t(st.libelle, { n: st.code === "EN_RETARD" ? st.jours : 0 });
