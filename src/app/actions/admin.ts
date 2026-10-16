"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Forfait } from "@prisma/client";
import { db } from "@/lib/db";
import { exigerAdmin } from "@/lib/admin";
import { getT } from "@/lib/i18n/server";
import { notifierSansEchec } from "@/lib/notifications";
import { ciblesRappel, envoyerRappel } from "@/lib/rappels";
import { N_ } from "@/lib/i18n/translate";

const JOUR = 86_400_000;
const texte = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const retour = (id: string, m: string, cle: "ok" | "erreur" = "erreur"): never =>
  redirect(`/admin/bailleurs/${id}?${cle}=${encodeURIComponent(m)}`);

async function organisation(form: FormData) {
  const admin = await exigerAdmin();
  const id = texte(form.get("id"));
  const org = await db.organisation.findUnique({ where: { id }, include: { abonnement: true } });
  if (!org) redirect("/admin/bailleurs");
  return { admin, org: org! };
}

/** Prolonge l'essai d'un compte de N jours (à partir de la fin actuelle, ou d'aujourd'hui si elle est passée). */
export async function prolongerEssai(form: FormData) {
  const { t } = await getT();
  const { admin, org } = await organisation(form);
  const jours = Number(texte(form.get("jours")));
  if (![7, 14, 30].includes(jours)) retour(org.id, t("Choisissez une durée."));
  const abo = org.abonnement;
  if (abo?.statut === "ACTIF") retour(org.id, t("Ce compte a un abonnement payant : l'essai ne s'applique pas."));
  const base = abo?.essaiFinLe && abo.essaiFinLe.getTime() > Date.now() ? abo.essaiFinLe.getTime() : Date.now();
  const fin = new Date(base + jours * JOUR);
  await db.abonnement.upsert({
    where: { organisationId: org.id },
    create: { organisationId: org.id, forfait: "DECOUVERTE", statut: "ESSAI", essaiFinLe: fin },
    update: { statut: "ESSAI", essaiFinLe: fin },
  });
  await db.journalAction.create({
    data: { organisationId: org.id, utilisateurId: admin.id, action: "admin.essai_prolonge", cible: `${jours}j` },
  });
  await notifierSansEchec({ organisationId: org.id, categorie: "ABONNEMENT", titre: N_("Essai prolongé"), texte: N_("Votre essai gratuit est prolongé de {n} jours."), donnees: { n: jours }, lien: "/parametres/abonnement" });
  revalidatePath("/admin", "layout");
  retour(org.id, t("Essai prolongé de {n} jours.", { n: jours }), "ok");
}

/** Donne accès à un forfait pendant l'essai (pour que le testeur essaie Pro ou Agence). Jamais sur un compte payant. */
export async function changerForfaitEssai(form: FormData) {
  const { t } = await getT();
  const { admin, org } = await organisation(form);
  const forfait = texte(form.get("forfait"));
  if (!["DECOUVERTE", "PRO", "AGENCE"].includes(forfait)) retour(org.id, t("Choisissez un forfait."));
  const abo = org.abonnement;
  if (abo?.statut === "ACTIF") retour(org.id, t("Ce compte a un abonnement payant : le forfait ne se change pas ici."));
  const fin = abo?.essaiFinLe && abo.essaiFinLe.getTime() > Date.now() ? abo.essaiFinLe : new Date(Date.now() + 14 * JOUR);
  await db.abonnement.upsert({
    where: { organisationId: org.id },
    create: { organisationId: org.id, forfait: forfait as Forfait, statut: "ESSAI", essaiFinLe: fin },
    update: { forfait: forfait as Forfait, statut: "ESSAI", essaiFinLe: fin },
  });
  await db.journalAction.create({
    data: { organisationId: org.id, utilisateurId: admin.id, action: "admin.forfait_essai", cible: forfait },
  });
  await notifierSansEchec({ organisationId: org.id, categorie: "ABONNEMENT", titre: N_("Forfait d'essai mis à jour"), texte: N_("Votre essai donne maintenant accès au forfait {forfait}."), donnees: { forfait }, lien: "/parametres/abonnement" });
  revalidatePath("/admin", "layout");
  retour(org.id, t("Forfait d'essai mis à jour."), "ok");
}

/** Rappel de renouvellement pour un compte (WhatsApp + alerte dans l'application). */
export async function rappelerCompte(form: FormData) {
  const { t } = await getT();
  const { admin, org } = await organisation(form);
  const cible = (await ciblesRappel()).find((c) => c.organisationId === org.id);
  if (!cible) retour(org.id, t("Ce compte n'a pas de rappel à recevoir pour le moment."));
  const r = await envoyerRappel(cible!);
  if (r === "sans_numero") retour(org.id, t("Ce compte n'a pas de numéro de téléphone."));
  if (r === "deja") retour(org.id, t("Ce compte a déjà reçu un rappel ces 3 derniers jours."));
  await db.journalAction.create({ data: { organisationId: org.id, utilisateurId: admin.id, action: "admin.rappel", cible: cible!.motif } });
  revalidatePath("/admin", "layout");
  retour(org.id, t("Rappel envoyé."), "ok");
}

/** Rappelle d'un coup tous les comptes dont l'essai se termine, est terminé, ou dont l'abonnement est en retard. */
export async function rappelerComptes() {
  const { t } = await getT();
  const admin = await exigerAdmin();
  const cibles = (await ciblesRappel()).slice(0, 100); // plafond : un envoi en masse reste maîtrisé
  let envoyes = 0, deja = 0, sansNumero = 0;
  for (const c of cibles) {
    const r = await envoyerRappel(c);
    if (r === "envoye") {
      envoyes++;
      await db.journalAction.create({ data: { organisationId: c.organisationId, utilisateurId: admin.id, action: "admin.rappel", cible: c.motif } });
    } else if (r === "deja") deja++;
    else sansNumero++;
  }
  revalidatePath("/admin", "layout");
  const m = t("{n} rappel(s) envoyé(s), {d} déjà relancé(s) récemment, {s} sans numéro.", { n: envoyes, d: deja, s: sansNumero });
  redirect(`/admin/abonnements?ok=${encodeURIComponent(m)}`);
}
