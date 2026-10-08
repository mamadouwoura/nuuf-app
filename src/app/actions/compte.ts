"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CanalPaiement, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { FORFAITS } from "@/lib/forfaits";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { hashPassword, normalizePhone, verifyPassword } from "@/lib/security";
import { getUser, startSession } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const texte = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const retour = (m: string, cle: "ok" | "erreur" = "erreur"): never => redirect(`/parametres?${cle}=${encodeURIComponent(m)}`);

async function proprietaire() {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role !== "PROPRIETAIRE") retour(t("Seul le propriétaire du compte peut faire cette modification."));
  return { user, membre };
}

export async function majProfil(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const nom = texte(form.get("nomComplet"));
  if (nom.length < 3) retour(t("Indiquez votre prénom et nom."));
  await db.utilisateur.update({ where: { id: user.id }, data: { nomComplet: nom } });
  if (user.membres[0].role === "PROPRIETAIRE") {
    await db.organisation.update({ where: { id: user.membres[0].organisationId }, data: { nom, ninea: texte(form.get("ninea")) || null } });
  }
  revalidatePath("/parametres");
  retour(t("Profil mis à jour."), "ok");
}

export async function ajouterCompteEncaissement(form: FormData) {
  const { t } = await getT();
  const { membre } = await proprietaire();
  const canal = texte(form.get("canal")) as CanalPaiement;
  const tel = normalizePhone(texte(form.get("telephone")));
  if (canal !== "WAVE" && canal !== "ORANGE_MONEY") retour(t("Choisissez Wave ou Orange Money."));
  if (!tel) retour(t("Numéro invalide. Exemple : 77 123 45 67"));
  await db.compteEncaissement.create({
    data: { organisationId: membre.organisationId, canal, telephone: tel!, libelle: texte(form.get("libelle")) || null },
  });
  retour(t("Compte d'encaissement ajouté."), "ok");
}

export async function supprimerCompteEncaissement(form: FormData) {
  const { t } = await getT();
  const { membre } = await proprietaire();
  await db.compteEncaissement.deleteMany({ where: { id: texte(form.get("id")), organisationId: membre.organisationId } });
  retour(t("Compte d'encaissement retiré."), "ok");
}

export async function ajouterMembre(form: FormData) {
  const { t } = await getT();
  const { user, membre } = await proprietaire();
  const abo = membre.organisation.abonnement;
  const max = FORFAITS[abo?.forfait ?? "DECOUVERTE"].acces;
  const nb = await db.membre.count({ where: { organisationId: membre.organisationId } });
  if (nb >= max) retour(max === 1 ? t("Votre forfait ne permet qu'un seul accès. Passez au forfait Pro pour ajouter votre équipe.") : t("Votre forfait est limité à {max} accès.", { max }));

  const nom = texte(form.get("nomComplet"));
  const tel = normalizePhone(texte(form.get("telephone")));
  const role = texte(form.get("role")) as Role;
  const mdp = String(form.get("motDePasse") ?? "");
  if (nom.length < 3) retour(t("Indiquez le nom de la personne."));
  if (!tel) retour(t("Numéro invalide. Exemple : 77 123 45 67"));
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour(t("Choisissez un rôle."));
  const faible = erreurMotDePasse(mdp, tel);
  if (faible) retour(t(faible));
  if (await db.utilisateur.findUnique({ where: { telephone: tel! } })) retour(t("Un compte existe déjà avec ce numéro."));

  const cree = await db.utilisateur.create({
    data: {
      telephone: tel!,
      nomComplet: nom,
      motDePasse: hashPassword(mdp),
      membres: { create: { organisationId: membre.organisationId, role } },
    },
  });
  await db.journalAction.create({
    data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "equipe.ajout", cible: cree.id },
  });
  retour(t("{nom} peut maintenant se connecter avec son numéro et le mot de passe provisoire.", { nom }), "ok");
}

export async function retirerMembre(form: FormData) {
  const { t } = await getT();
  const { user, membre } = await proprietaire();
  const id = texte(form.get("membreId"));
  const cible = await db.membre.findFirst({ where: { id, organisationId: membre.organisationId } });
  if (!cible || cible.role === "PROPRIETAIRE") retour(t("Ce membre ne peut pas être retiré."));
  await db.utilisateur.delete({ where: { id: cible!.utilisateurId } });
  await db.journalAction.create({
    data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "equipe.retrait", cible: cible!.utilisateurId },
  });
  retour(t("Accès retiré."), "ok");
}

export async function changerRole(form: FormData) {
  const { t } = await getT();
  const { membre } = await proprietaire();
  const role = texte(form.get("role")) as Role;
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour(t("Rôle invalide."));
  await db.membre.updateMany({
    where: { id: texte(form.get("membreId")), organisationId: membre.organisationId, role: { not: "PROPRIETAIRE" } },
    data: { role },
  });
  retour(t("Rôle mis à jour."), "ok");
}

export async function changerMotDePasse(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const ancien = String(form.get("ancien") ?? "");
  const nouveau = String(form.get("nouveau") ?? "");
  if (!verifyPassword(ancien, user.motDePasse)) retour(t("Mot de passe actuel incorrect."));
  const faible = erreurMotDePasse(nouveau, user.telephone);
  if (faible) retour(t(faible));
  await db.utilisateur.update({ where: { id: user.id }, data: { motDePasse: hashPassword(nouveau), sessionVersion: { increment: 1 } } });
  // La session en cours reste ouverte ; toutes les autres (autres appareils) sont coupées.
  await startSession(user.id);
  retour(t("Mot de passe modifié."), "ok");
}

/** Coupe toutes les sessions ouvertes (autres appareils) sans changer le mot de passe ; l'appareil actuel reste connecté. */
export async function deconnecterAutresAppareils() {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  await db.utilisateur.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  await startSession(user.id);
  retour(t("Tous vos autres appareils ont été déconnectés."), "ok");
}
