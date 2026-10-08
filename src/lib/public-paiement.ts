import { db } from "./db";
import { fcfa, initiales, telAffiche } from "./immo";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const moisLongFr = (d: Date) => `${MOIS[d.getUTCMonth()].replace(/^./, (c) => c.toUpperCase())} ${d.getUTCFullYear()}`;
export const dateLongFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

/** Échéance retrouvée par son lien secret, avec tout le contexte d'affichage côté locataire. */
export async function chargerParJeton(jeton: string) {
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
      mois: moisLongFr(e.mois),
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
