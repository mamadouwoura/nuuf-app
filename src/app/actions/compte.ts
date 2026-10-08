"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CanalPaiement, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { FORFAITS } from "@/lib/forfaits";
import { hashPassword, normalizePhone, verifyPassword } from "@/lib/security";
import { getUser } from "@/lib/session";

const texte = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const retour = (m: string, cle: "ok" | "erreur" = "erreur"): never => redirect(`/parametres?${cle}=${encodeURIComponent(m)}`);

async function proprietaire() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role !== "PROPRIETAIRE") retour("Seul le propriétaire du compte peut faire cette modification.");
  return { user, membre };
}

export async function majProfil(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const nom = texte(form.get("nomComplet"));
  if (nom.length < 3) retour("Indiquez votre prénom et nom.");
  await db.utilisateur.update({ where: { id: user.id }, data: { nomComplet: nom } });
  if (user.membres[0].role === "PROPRIETAIRE") {
    await db.organisation.update({ where: { id: user.membres[0].organisationId }, data: { nom, ninea: texte(form.get("ninea")) || null } });
  }
  revalidatePath("/parametres");
  retour("Profil mis à jour.", "ok");
}

export async function ajouterCompteEncaissement(form: FormData) {
  const { membre } = await proprietaire();
  const canal = texte(form.get("canal")) as CanalPaiement;
  const tel = normalizePhone(texte(form.get("telephone")));
  if (canal !== "WAVE" && canal !== "ORANGE_MONEY") retour("Choisissez Wave ou Orange Money.");
  if (!tel) retour("Numéro invalide. Exemple : 77 123 45 67");
  await db.compteEncaissement.create({
    data: { organisationId: membre.organisationId, canal, telephone: tel!, libelle: texte(form.get("libelle")) || null },
  });
  retour("Compte d'encaissement ajouté.", "ok");
}

export async function supprimerCompteEncaissement(form: FormData) {
  const { membre } = await proprietaire();
  await db.compteEncaissement.deleteMany({ where: { id: texte(form.get("id")), organisationId: membre.organisationId } });
  retour("Compte d'encaissement retiré.", "ok");
}

export async function ajouterMembre(form: FormData) {
  const { user, membre } = await proprietaire();
  const abo = membre.organisation.abonnement;
  const max = FORFAITS[abo?.forfait ?? "DECOUVERTE"].acces;
  const nb = await db.membre.count({ where: { organisationId: membre.organisationId } });
  if (nb >= max) retour(max === 1 ? "Votre forfait ne permet qu'un seul accès. Passez au forfait Pro pour ajouter votre équipe." : `Votre forfait est limité à ${max} accès.`);

  const nom = texte(form.get("nomComplet"));
  const tel = normalizePhone(texte(form.get("telephone")));
  const role = texte(form.get("role")) as Role;
  const mdp = String(form.get("motDePasse") ?? "");
  if (nom.length < 3) retour("Indiquez le nom de la personne.");
  if (!tel) retour("Numéro invalide. Exemple : 77 123 45 67");
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour("Choisissez un rôle.");
  if (mdp.length < 8) retour("Le mot de passe provisoire doit contenir au moins 8 caractères.");
  if (await db.utilisateur.findUnique({ where: { telephone: tel! } })) retour("Un compte existe déjà avec ce numéro.");

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
  retour(`${nom} peut maintenant se connecter avec son numéro et le mot de passe provisoire.`, "ok");
}

export async function retirerMembre(form: FormData) {
  const { user, membre } = await proprietaire();
  const id = texte(form.get("membreId"));
  const cible = await db.membre.findFirst({ where: { id, organisationId: membre.organisationId } });
  if (!cible || cible.role === "PROPRIETAIRE") retour("Ce membre ne peut pas être retiré.");
  await db.utilisateur.delete({ where: { id: cible!.utilisateurId } });
  await db.journalAction.create({
    data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "equipe.retrait", cible: cible!.utilisateurId },
  });
  retour("Accès retiré.", "ok");
}

export async function changerRole(form: FormData) {
  const { membre } = await proprietaire();
  const role = texte(form.get("role")) as Role;
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour("Rôle invalide.");
  await db.membre.updateMany({
    where: { id: texte(form.get("membreId")), organisationId: membre.organisationId, role: { not: "PROPRIETAIRE" } },
    data: { role },
  });
  retour("Rôle mis à jour.", "ok");
}

export async function changerMotDePasse(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const ancien = String(form.get("ancien") ?? "");
  const nouveau = String(form.get("nouveau") ?? "");
  if (!verifyPassword(ancien, user.motDePasse)) retour("Mot de passe actuel incorrect.");
  if (nouveau.length < 8) retour("Le nouveau mot de passe doit contenir au moins 8 caractères.");
  await db.utilisateur.update({ where: { id: user.id }, data: { motDePasse: hashPassword(nouveau) } });
  retour("Mot de passe modifié.", "ok");
}
