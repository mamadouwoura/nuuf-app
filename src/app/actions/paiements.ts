"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { solderEtQuittancer } from "@/lib/encaissement";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

/** Encaissement d'un loyer en espèces : paiement confirmé + quittance numérotée. */
export async function encaisserEspeces(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const brut = String(form.get("retour") ?? "");
  const retour = /^\/(?!\/)[\w\-/?=&%.]*$/.test(brut) ? brut : "/paiements"; // chemin interne uniquement, jamais d'URL externe
  const avec = (k: string, v: string) => `${retour}${retour.includes("?") ? "&" : "?"}${k}=${encodeURIComponent(v)}`;
  if (membre.role === "LECTURE_SEULE") redirect(avec("erreur", t("Votre rôle ne permet pas d'encaisser.")));
  if (!etatAcces(membre.organisation.abonnement).ecriture) redirect(avec("erreur", t("Accès en lecture seule : activez un abonnement pour encaisser.")));
  const echeanceId = String(form.get("echeanceId") ?? "");
  const montant = Number(String(form.get("montant") ?? "").replace(/\D/g, "")) || 0;

  const echeance = await db.echeance.findFirst({
    where: { id: echeanceId, bail: { bien: { organisationId: membre.organisationId } } },
    include: { paiements: { where: { statut: "CONFIRME" } } },
  });
  const fail = (m: string): never => redirect(avec("erreur", m));
  if (!echeance) fail(t("Échéance introuvable."));
  const dejaPaye = echeance!.paiements.reduce((s, p) => s + p.montant, 0);
  const reste = echeance!.montantDu - dejaPaye;
  if (montant <= 0) fail(t("Indiquez un montant."));
  if (montant > reste) fail(t("Le montant dépasse le reste dû ({reste} FCFA).", { reste }));

  // Verrou sur l'échéance : deux encaissements simultanés ne peuvent pas dépasser le loyer dû.
  const resultat = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Echeance" WHERE id = ${echeanceId} FOR UPDATE`;
    const deja = await tx.paiement.aggregate({ where: { echeanceId, statut: "CONFIRME" }, _sum: { montant: true } });
    const resteActuel = echeance!.montantDu - (deja._sum.montant ?? 0);
    if (montant > resteActuel) return { refus: t("Le montant dépasse le reste dû ({reste} FCFA).", { reste: resteActuel }) };
    const paiement = await tx.paiement.create({
      data: { echeanceId, montant, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() },
    });
    await solderEtQuittancer(tx, { organisationId: membre.organisationId, echeanceId, paiementId: paiement.id });
    await tx.journalAction.create({
      data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "paiement.especes", cible: paiement.id },
    });
    return { refus: null };
  });
  if (resultat.refus) fail(resultat.refus);

  revalidatePath("/paiements");
  revalidatePath("/tableau-de-bord");
  redirect(avec("ok", "1"));
}
