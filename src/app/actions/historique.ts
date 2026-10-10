"use server";

import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { PLAFOND_CONSULTATIONS, chercherHistorique, consultationsDuJour, type ResultatHistorique } from "@/lib/historique";
import { normaliserCni } from "@/lib/fiche";
import { normalizePhone } from "@/lib/security";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export type EtatRecherche = { erreur?: string; telephone?: string; resultat?: ResultatHistorique | null } | null;

/** Recherche l'historique locatif d'un candidat chez les autres agences, avec son accord déclaré. */
export async function rechercherCandidat(_: EtatRecherche, form: FormData): Promise<EtatRecherche> {
  const { t } = await getT();
  const user = await getUser();
  if (!user) return { erreur: t("Session expirée. Reconnectez-vous.") };
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE") return { erreur: t("Votre rôle ne permet pas de consulter un historique.") };
  if (!etatAcces(membre.organisation.abonnement).ecriture) return { erreur: t("Accès en lecture seule : activez un abonnement pour consulter un historique.") };
  if (form.get("accord") !== "on") return { erreur: t("Confirmez que le candidat a donné son accord pour cette vérification.") };
  const telBrut = String(form.get("telephone") ?? "").trim();
  const cniBrut = String(form.get("cni") ?? "").trim();
  if (!telBrut && !cniBrut) return { erreur: t("Indiquez le numéro de téléphone ou le numéro de pièce d'identité du candidat.") };
  const telephone = telBrut ? normalizePhone(telBrut) : null;
  if (telBrut && !telephone) return { erreur: t("Numéro invalide. Exemple : 77 123 45 67") };
  const cniNorm = cniBrut ? normaliserCni(cniBrut) : null;
  if (cniBrut && !cniNorm) return { erreur: t("Numéro de pièce d'identité trop court (6 caractères minimum).") };
  if ((await consultationsDuJour(membre.organisationId)) >= PLAFOND_CONSULTATIONS) {
    return { erreur: t("Limite de {n} recherches par 24 h atteinte. Réessayez demain.", { n: PLAFOND_CONSULTATIONS }) };
  }
  const resultat = await chercherHistorique(membre.organisationId, { telephone, cniNorm });
  await db.consultationHistorique.create({
    // On garde la trace de ce qui a été cherché ; une pièce d'identité n'est conservée que masquée.
    data: {
      organisationId: membre.organisationId,
      utilisateurId: user.id,
      telephone: telephone ?? `PIECE …${(cniNorm ?? "").slice(-3)}`,
      dossiers: resultat?.dossiers.length ?? 0,
    },
  });
  return { telephone: telephone ?? undefined, resultat };
}
