import { N_ } from "@/lib/i18n/translate";

/** Valeurs acceptées pour les listes de la fiche de renseignement (le libellé est traduit à l'affichage). */
export const SITUATIONS = [
  { code: "CELIBATAIRE", libelle: N_("Célibataire") },
  { code: "MARIE", libelle: N_("Marié(e)") },
  { code: "AUTRE", libelle: N_("Autre") },
] as const;

export const STATUTS_PRO = [
  { code: "SALARIE", libelle: N_("Salarié") },
  { code: "ENTREPRENEUR", libelle: N_("Entrepreneur") },
  { code: "LIBERAL", libelle: N_("Libéral") },
  { code: "AUTRE", libelle: N_("Autre") },
] as const;

export const JUSTIFICATIFS = [
  { code: "CNI", libelle: N_("Copie de la pièce d'identité en cours de validité") },
  { code: "BULLETIN", libelle: N_("Bulletin de salaire (preuve de revenu)") },
  { code: "ATTESTATION", libelle: N_("Attestation de travail ou d'activité") },
  { code: "AUTRE", libelle: N_("Autre justificatif de revenu") },
] as const;

const codes = (l: readonly { code: string }[]) => l.map((x) => x.code);

/** Numéro de pièce d'identité comparable : lettres et chiffres uniquement, en majuscules (6 caractères minimum). */
export function normaliserCni(v: string | null | undefined): string | null {
  const n = (v ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return n.length >= 6 ? n : null;
}

/** Une signature acceptée est une image PNG encodée en base64, de taille raisonnable. */
export function signatureValide(v: string): boolean {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(v);
  if (!m || v.length > 250_000) return false;
  const octets = Buffer.from(m[1], "base64");
  return octets.length > 200 && octets.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

export const situationValide = (v: string) => codes(SITUATIONS).includes(v);
export const statutProValide = (v: string) => codes(STATUTS_PRO).includes(v);
export const justificatifsValides = (vs: string[]) => vs.filter((v) => codes(JUSTIFICATIFS).includes(v));

/** La fiche est considérée complète quand l'essentiel de l'identité et de la situation est renseigné. */
export function ficheComplete(l: {
  dateNaissance: Date | null;
  lieuNaissance: string | null;
  cni: string | null;
  profession: string | null;
  dernierDomicile: string | null;
  contactUrgenceTel: string | null;
  statutPro: string | null;
}): boolean {
  return !!(l.dateNaissance && l.lieuNaissance && l.cni && l.profession && l.dernierDomicile && l.contactUrgenceTel && l.statutPro);
}
