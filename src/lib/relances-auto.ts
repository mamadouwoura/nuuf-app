import { db } from "./db";
import { etatAcces } from "./abonnement";
import { lienPaiement } from "./encaissement";
import { envoyerMessage, modeMessagerie } from "./messagerie";
import { fcfa } from "./immo";
import { assurerEcheances, debutMois } from "./loyers";

const JOUR = 86_400_000;

type Declencheur = "J-3" | "J+1" | "J+5";

/** Quel rappel est dû pour ce décalage (en jours, négatif = avant l'échéance) ? */
export function declencheurDu(jours: number, p: { avantEcheance: boolean; apresJ1: boolean; apresJ5: boolean }): Declencheur | null {
  if (jours >= 5 && p.apresJ5) return "J+5";
  if (jours >= 1 && jours < 5 && p.apresJ1) return "J+1";
  if (jours <= -1 && jours >= -3 && p.avantEcheance) return "J-3";
  return null;
}

/**
 * Crée les échéances du mois pour tous les baux actifs, sans attendre que le bailleur ouvre l'application :
 * sans elles, aucun rappel ne partirait pour un bailleur qui ne se connecte pas. Dans les quatre derniers
 * jours du mois, celles du mois suivant sont créées aussi, pour que le rappel « J-3 » d'un loyer dû le 1er parte.
 */
export async function creerEcheancesDuMois(now = new Date()) {
  const baux = await db.bail.findMany({
    where: { actif: true, bien: { archiveLe: null } },
    select: { bien: { select: { organisationId: true } } },
  });
  const organisations = [...new Set(baux.map((b) => b.bien.organisationId))];
  const ceMois = debutMois(now);
  const dernierJour = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const moisSuivant = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const bientotFinDeMois = dernierJour - now.getUTCDate() <= 3;
  for (const id of organisations) {
    await assurerEcheances(id, ceMois);
    if (bientotFinDeMois) await assurerEcheances(id, moisSuivant);
  }
  return organisations.length;
}

/**
 * Parcourt les loyers impayés et envoie les rappels prévus (J-3, J+1, J+5) selon les réglages de
 * chaque organisation. Idempotent : un même rappel n'est jamais envoyé deux fois pour une échéance.
 */
export async function lancerRelancesAutomatiques(now = new Date()) {
  await creerEcheancesDuMois(now);
  const debutJour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const echeances = await db.echeance.findMany({
    where: {
      statut: { not: "PAYEE" },
      dateLimite: { gte: new Date(debutJour - 60 * JOUR), lte: new Date(debutJour + 3 * JOUR) },
    },
    include: {
      paiements: { where: { statut: "CONFIRME" } },
      relances: true,
      bail: { include: { locataire: true, bien: { include: { organisation: { include: { abonnement: true } } } } } },
    },
  });

  const reglages = new Map((await db.parametresRelance.findMany()).map((p) => [p.organisationId, p]));
  let envoyees = 0;
  let ignorees = 0;
  for (const e of echeances) {
    const org = e.bail.bien.organisation;
    if (!e.bail.actif || !etatAcces(org.abonnement, now).ecriture) { ignorees++; continue; }
    const reste = e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0);
    if (reste <= 0) continue;
    const jours = Math.round((debutJour - e.dateLimite.getTime()) / JOUR);
    const d = declencheurDu(jours, reglages.get(org.id) ?? { avantEcheance: true, apresJ1: true, apresJ5: true });
    if (!d || e.relances.some((r) => r.declencheur === d)) continue;

    const lien = await lienPaiement(e.id);
    const prenom = e.bail.locataire.nomComplet.split(" ")[0];
    const bien = e.bail.bien.designation;
    const montant = `${fcfa(reste)} FCFA`;
    const texte =
      d === "J-3"
        ? `Bonjour ${prenom}, votre loyer de ${bien} (${montant}) arrive à échéance bientôt. Réglez-le en un clic (Wave ou Orange Money) : ${lien}`
        : d === "J+1"
          ? `Bonjour ${prenom}, le loyer de ${bien} (${montant}) est arrivé à échéance. Vous pouvez le régler en un clic (Wave ou Orange Money) : ${lien}`
          : `Bonjour ${prenom}, sauf erreur de notre part, le loyer de ${bien} (${montant}) reste impayé. Merci de le régler dès que possible : ${lien}`;

    const parti = await envoyerMessage({ type: "RELANCE", destinataire: e.bail.locataire.telephone, texte, organisationId: org.id });
    // En mode simulation on trace aussi la relance pour que le comportement soit observable ; en mode
    // désactivé ou en échec rien n'est tracé, le rappel sera retenté au prochain passage.
    if (parti || modeMessagerie() === "simulation") {
      await db.relance.create({ data: { echeanceId: e.id, declencheur: d } });
      envoyees++;
    } else {
      ignorees++;
    }
  }
  return { examinees: echeances.length, envoyees, ignorees };
}
