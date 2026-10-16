"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { cleMois } from "@/lib/loyers";
import { CATEGORIES_ENTREE, CATEGORIES_SORTIE } from "@/lib/tresorerie";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const texte = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const entier = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\D/g, "")) || 0;

async function autorise(retour: string) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const vers = (m: string): never => redirect(`${retour}${retour.includes("?") ? "&" : "?"}erreur=${encodeURIComponent(m)}`);
  if (!membre || membre.role === "LECTURE_SEULE") vers(t("Votre rôle ne permet pas de modifier la trésorerie."));
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour modifier votre trésorerie."))}`);
  }
  return { user, orgId: membre.organisationId, vers, t };
}

/** Dépense ou entrée de l'agence hors loyers. */
export async function ajouterTransaction(form: FormData) {
  const sens = form.get("sens") === "ENTREE" ? "ENTREE" : "SORTIE";
  const date = new Date(`${texte(form.get("date"), 10)}T00:00:00.000Z`);
  const retour = `/tresorerie${Number.isNaN(date.getTime()) ? "" : `?mois=${cleMois(date)}`}`;
  const { user, orgId, vers, t } = await autorise(retour);
  if (Number.isNaN(date.getTime())) vers(t("Indiquez la date."));
  const libelle = texte(form.get("libelle"), 100);
  if (libelle.length < 2) vers(t("Indiquez le motif."));
  const montant = entier(form.get("montant"));
  if (montant <= 0) vers(t("Indiquez le montant."));
  const permises: readonly string[] = sens === "ENTREE" ? CATEGORIES_ENTREE : CATEGORIES_SORTIE;
  const categorie = permises.includes(texte(form.get("categorie"))) ? texte(form.get("categorie")) : "Autre";
  const proprietaireId = texte(form.get("proprietaireId"), 40);
  const proprietaire = proprietaireId ? await db.proprietaire.findFirst({ where: { id: proprietaireId, organisationId: orgId }, select: { id: true } }) : null;
  await db.transaction.create({ data: { organisationId: orgId, sens, categorie, libelle, montant, date, proprietaireId: proprietaire?.id ?? null } });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "tresorerie.ajout", cible: sens } });
  redirect(retour);
}

export async function supprimerTransaction(form: FormData) {
  const cle = texte(form.get("mois"), 7);
  const retour = /^\d{4}-(0[1-9]|1[0-2])$/.test(cle) ? `/tresorerie?mois=${cle}` : "/tresorerie";
  const { orgId } = await autorise(retour);
  await db.transaction.deleteMany({ where: { id: texte(form.get("id"), 40), organisationId: orgId } });
  redirect(retour);
}
