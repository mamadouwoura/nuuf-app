"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { appliquerResultat, initierTransaction, modeSimulation, type Canal } from "@/lib/passerelle";

/** Le locataire choisit Wave ou Orange Money depuis son lien : on crée la transaction. */
export async function initierPaiement(form: FormData) {
  const jeton = String(form.get("jeton") ?? "");
  const canal = String(form.get("canal") ?? "") as Canal;
  const retour = (m: string): never => redirect(`/paiement/${jeton}?erreur=${encodeURIComponent(m)}`);
  if (canal !== "WAVE" && canal !== "ORANGE_MONEY") retour("Choisissez un moyen de paiement.");

  const e = await db.echeance.findUnique({
    where: { jetonPaiement: jeton },
    include: { paiements: { where: { statut: "CONFIRME" } }, bail: { include: { locataire: true } } },
  });
  if (!e || !e.jetonExpireLe || e.jetonExpireLe < new Date()) redirect(`/paiement/${jeton}`);
  const reste = e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0);
  if (reste <= 0) redirect(`/paiement/${jeton}`);

  const t = await initierTransaction({ canal, montant: reste, telephone: e.bail.locataire.telephone });
  await db.paiement.create({
    data: { echeanceId: e.id, montant: reste, canal, statut: "INITIE", referenceOperateur: t.reference },
  });
  redirect(t.urlSuite);
}

/** Page de simulation uniquement : joue le rôle de l'opérateur. */
export async function resultatSimulation(form: FormData) {
  if (!modeSimulation()) redirect("/");
  const reference = String(form.get("reference") ?? "");
  const issue = form.get("issue") === "ok" ? "CONFIRME" : "ECHEC";
  const r = await appliquerResultat(reference, issue);
  if (!r) redirect("/");
  if ("abonnement" in r) redirect(issue === "CONFIRME" ? "/parametres/abonnement?ok=paye" : "/abonnement/forfait?erreur=" + encodeURIComponent("Le paiement n'a pas abouti. Aucun montant n'a été débité."));
  redirect(issue === "CONFIRME" ? `/paiement/${r.jeton}/confirmation?ref=${reference}` : `/paiement/${r.jeton}/echec?ref=${reference}`);
}
