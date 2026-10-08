import { db } from "./db";
import { fcfa, initiales, telAffiche } from "./immo";
import type { Locale } from "@/lib/i18n/config";
import { formaterDate, moisAnnee } from "@/lib/i18n/format";

export const moisLongFr = (d: Date, locale: Locale = "fr") => moisAnnee(d, locale);
export const dateLongFr = (d: Date, locale: Locale = "fr") => formaterDate(d, locale);

/** Échéance retrouvée par son lien secret, avec tout le contexte d'affichage côté locataire. */
export async function chargerParJeton(jeton: string, locale: Locale = "fr") {
  const e = await db.echeance.findUnique({
    where: { jetonPaiement: jeton },
    include: {
      paiements: { where: { statut: "CONFIRME" }, orderBy: { creeLe: "desc" }, include: { quittance: true } },
      bail: {
        include: {
          locataire: true,
          bien: { include: { organisation: { include: { membres: { where: { role: "PROPRIETAIRE" }, include: { utilisateur: true } } } } } },
        },
      },
    },
  });
  if (!e) return null;
  const bien = e.bail.bien;
  const proprio = bien.organisation.membres[0]?.utilisateur;
  const paye = e.paiements.reduce((s, p) => s + p.montant, 0);
  const reste = Math.max(0, e.montantDu - paye);
  const tel = proprio?.telephone ?? "";
  return {
    e,
    reste,
    expire: !e.jetonExpireLe || e.jetonExpireLe < new Date(),
    infos: {
      bien: bien.designation,
      lieu: `${bien.quartier}, ${bien.ville}`,
      mois: moisLongFr(e.mois, locale),
      montant: fcfa(reste || e.montantDu),
      bailleur: bien.organisation.nom,
      bailleurInit: initiales(bien.organisation.nom),
      bailleurTel: telAffiche(tel),
      bailleurWa: `https://wa.me/${tel.replace(/\D/g, "")}`,
    },
    locataire: e.bail.locataire,
    bailleurTelBrut: tel.replace(/\D/g, ""),
  };
}
