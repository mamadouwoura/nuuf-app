import { db } from "./db";
import { listerBailleurs } from "./admin";
import { envoyerMessage } from "./messagerie";
import { notifierSansEchec } from "./notifications";
import { appUrl } from "./quittance";
import { N_ } from "./i18n/translate";

/** Un même compte n'est pas relancé deux fois en moins de 3 jours. */
export const DELAI_ENTRE_RAPPELS_JOURS = 3;
/** Les essais qui se terminent dans ce nombre de jours (ou moins) reçoivent un rappel. */
export const SEUIL_ESSAI_JOURS = 5;

export type MotifRappel = "ESSAI_BIENTOT" | "ESSAI_TERMINE" | "GRACE";

export type CibleRappel = {
  organisationId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  motif: MotifRappel;
  jours: number;
};

/** Motif de rappel d'après l'état d'accès d'un compte, ou null s'il n'y a rien à rappeler. */
export function motifRappel(etat: string, joursRestants: number | null): MotifRappel | null {
  if (etat === "ESSAI") return (joursRestants ?? 99) <= SEUIL_ESSAI_JOURS ? "ESSAI_BIENTOT" : null;
  if (etat === "ESSAI_TERMINE" || etat === "LECTURE_SEULE") return "ESSAI_TERMINE";
  if (etat === "GRACE") return "GRACE";
  return null;
}

/** Message WhatsApp (français) envoyé au propriétaire du compte. */
export function messageRappel(c: Pick<CibleRappel, "prenom" | "motif" | "jours">, base = appUrl()) {
  const lien = `${base}/abonnement/forfait`;
  if (c.motif === "ESSAI_BIENTOT") {
    return `Bonjour ${c.prenom}, votre essai gratuit Nuuf se termine dans ${c.jours} jour(s). Choisissez votre forfait pour continuer sans interruption : ${lien}`;
  }
  if (c.motif === "GRACE") {
    return `Bonjour ${c.prenom}, votre abonnement Nuuf est arrivé à échéance. Réglez-le sous ${c.jours} jour(s) pour éviter le passage en lecture seule : ${lien}`;
  }
  return `Bonjour ${c.prenom}, votre essai Nuuf est terminé. Vos données sont conservées en lecture seule ; réactivez votre compte quand vous voulez : ${lien}`;
}

/** Tous les comptes à relancer, d'après l'état réel de leur abonnement. Réservé à l'administrateur (vérifié par listerBailleurs). */
export async function ciblesRappel(): Promise<CibleRappel[]> {
  const lignes = await listerBailleurs();
  const cibles: CibleRappel[] = [];
  for (const l of lignes) {
    if (l.categorie === "payant" && l.acces.etat !== "GRACE") continue;
    const motif = motifRappel(l.acces.etat, l.acces.joursRestants);
    if (!motif) continue;
    cibles.push({
      organisationId: l.id,
      nom: l.nom,
      prenom: (l.proprio?.nomComplet ?? l.nom).split(" ")[0],
      telephone: l.proprio?.telephone ?? null,
      motif,
      jours: l.acces.joursRestants ?? 0,
    });
  }
  return cibles;
}

export type ResultatRappel = "envoye" | "deja" | "sans_numero";

/** Envoie un rappel (WhatsApp + alerte dans l'application), sauf si le compte a déjà été relancé récemment. */
export async function envoyerRappel(c: CibleRappel, now = new Date()): Promise<ResultatRappel> {
  if (!c.telephone) return "sans_numero";
  const depuis = new Date(now.getTime() - DELAI_ENTRE_RAPPELS_JOURS * 86_400_000);
  if ((await db.message.count({ where: { organisationId: c.organisationId, type: "RENOUVELLEMENT", creeLe: { gte: depuis } } })) > 0) return "deja";
  await envoyerMessage({ type: "RENOUVELLEMENT", destinataire: c.telephone, texte: messageRappel(c), organisationId: c.organisationId });
  await notifierSansEchec({
    organisationId: c.organisationId,
    categorie: "ABONNEMENT",
    titre: N_("Rappel d'abonnement"),
    texte: c.motif === "ESSAI_BIENTOT" ? N_("Votre essai gratuit se termine dans {n} jour(s).") : c.motif === "GRACE" ? N_("Votre abonnement est arrivé à échéance : réglez-le sous {n} jour(s).") : N_("Votre essai est terminé : vos données sont en lecture seule."),
    donnees: { n: c.jours },
    lien: "/abonnement/forfait",
  });
  return "envoye";
}
