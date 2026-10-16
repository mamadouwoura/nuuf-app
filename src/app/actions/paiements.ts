"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { solderEtQuittancer } from "@/lib/encaissement";
import { MOIS_D_AVANCE, debutMois } from "@/lib/loyers";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { peutAcceder } from "@/lib/permissions";

type Traduire = (cle: string, vars?: Record<string, string | number>) => string;

/** Vérifie l'utilisateur et le droit d'écriture ; renvoie de quoi rediriger avec un message. */
async function autoriseEncaissement(retourBrut: string, defaut: string) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const retour = /^\/(?!\/)[\w\-/?=&%.]*$/.test(retourBrut) ? retourBrut : defaut; // chemin interne uniquement, jamais d'URL externe
  const avec = (k: string, v: string) => `${retour}${retour.includes("?") ? "&" : "?"}${k}=${encodeURIComponent(v)}`;
  if (membre.role === "LECTURE_SEULE") redirect(avec("erreur", t("Votre rôle ne permet pas d'encaisser.")));
  if (!peutAcceder(membre, "LOYERS")) redirect(avec("erreur", t("Votre accès ne comprend pas ce module.")));
  if (!etatAcces(membre.organisation.abonnement).ecriture) redirect(avec("erreur", t("Accès en lecture seule : activez un abonnement pour encaisser.")));
  return { t, user, membre, avec, fail: (m: string): never => redirect(avec("erreur", m)) };
}

/**
 * Enregistre un paiement en espèces sur une échéance : paiement confirmé + quittance numérotée.
 * Verrou sur l'échéance : deux encaissements simultanés ne peuvent pas dépasser le loyer dû.
 * Renvoie un message de refus, ou null si tout s'est bien passé.
 */
async function enregistrerEspeces(p: { organisationId: string; userId: string; echeanceId: string; montantDu: number; montant: number; t: Traduire }) {
  const resultat = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Echeance" WHERE id = ${p.echeanceId} FOR UPDATE`;
    const deja = await tx.paiement.aggregate({ where: { echeanceId: p.echeanceId, statut: "CONFIRME" }, _sum: { montant: true } });
    const resteActuel = p.montantDu - (deja._sum.montant ?? 0);
    if (p.montant > resteActuel) return { refus: p.t("Le montant dépasse le reste dû ({reste} FCFA).", { reste: resteActuel }) };
    const paiement = await tx.paiement.create({
      data: { echeanceId: p.echeanceId, montant: p.montant, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() },
    });
    await solderEtQuittancer(tx, { organisationId: p.organisationId, echeanceId: p.echeanceId, paiementId: paiement.id, acteurId: p.userId });
    await tx.journalAction.create({
      data: { organisationId: p.organisationId, utilisateurId: p.userId, action: "paiement.especes", cible: paiement.id },
    });
    return { refus: null };
  });
  return resultat.refus;
}

/** Encaissement d'un loyer en espèces : paiement confirmé + quittance numérotée. */
export async function encaisserEspeces(form: FormData) {
  const { t, user, membre, avec, fail } = await autoriseEncaissement(String(form.get("retour") ?? ""), "/paiements");
  const echeanceId = String(form.get("echeanceId") ?? "");
  const montant = Number(String(form.get("montant") ?? "").replace(/\D/g, "")) || 0;

  const echeance = await db.echeance.findFirst({
    where: { id: echeanceId, bail: { bien: { organisationId: membre.organisationId } } },
    include: { paiements: { where: { statut: "CONFIRME" } } },
  });
  if (!echeance) fail(t("Échéance introuvable."));
  const dejaPaye = echeance!.paiements.reduce((s, p) => s + p.montant, 0);
  const reste = echeance!.montantDu - dejaPaye;
  if (montant <= 0) fail(t("Indiquez un montant."));
  if (montant > reste) fail(t("Le montant dépasse le reste dû ({reste} FCFA).", { reste }));

  const refus = await enregistrerEspeces({ organisationId: membre.organisationId, userId: user.id, echeanceId, montantDu: echeance!.montantDu, montant, t });
  if (refus) fail(refus);

  revalidatePath("/paiements");
  revalidatePath("/tableau-de-bord");
  redirect(avec("ok", "1"));
}

/**
 * Encaisse en espèces le loyer d'un mois à venir (« payé d'avance ») : l'échéance de ce mois est créée si
 * besoin, puis le paiement et la quittance sont enregistrés comme pour un loyer ordinaire.
 */
export async function encaisserDAvance(form: FormData) {
  const bailId = String(form.get("bailId") ?? "");
  const { t, user, membre, avec, fail } = await autoriseEncaissement(String(form.get("retour") ?? ""), "/biens");
  const cle = String(form.get("mois") ?? "");
  const montant = Number(String(form.get("montant") ?? "").replace(/\D/g, "")) || 0;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(cle)) fail(t("Choisissez le mois à payer."));
  const mois = new Date(Date.UTC(Number(cle.slice(0, 4)), Number(cle.slice(5)) - 1, 1));
  const courant = debutMois(new Date());
  const limite = new Date(Date.UTC(courant.getUTCFullYear(), courant.getUTCMonth() + MOIS_D_AVANCE, 1));
  if (mois <= courant || mois > limite) fail(t("Seuls les {n} prochains mois peuvent être payés d'avance.", { n: MOIS_D_AVANCE }));

  const bail = await db.bail.findFirst({ where: { id: bailId, actif: true, bien: { organisationId: membre.organisationId, archiveLe: null } } });
  if (!bail) fail(t("Location introuvable."));
  if (bail!.finLe && bail!.finLe < mois) fail(t("Le bail se termine avant ce mois."));
  if (montant <= 0) fail(t("Indiquez un montant."));

  const echeance = await db.echeance.upsert({
    where: { bailId_mois: { bailId: bail!.id, mois } },
    create: {
      bailId: bail!.id,
      mois,
      montantDu: bail!.loyerMensuel,
      dateLimite: new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth(), Math.min(bail!.jourEcheance, 28))),
    },
    update: {},
    include: { paiements: { where: { statut: "CONFIRME" } } },
  });
  const reste = echeance.montantDu - echeance.paiements.reduce((s, p) => s + p.montant, 0);
  if (montant > reste) fail(t("Le montant dépasse le reste dû ({reste} FCFA).", { reste }));

  const refus = await enregistrerEspeces({ organisationId: membre.organisationId, userId: user.id, echeanceId: echeance.id, montantDu: echeance.montantDu, montant, t });
  if (refus) fail(refus);

  revalidatePath("/paiements");
  revalidatePath("/statistiques");
  redirect(avec("ok", "avance"));
}
