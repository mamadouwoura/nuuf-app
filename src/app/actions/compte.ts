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
import { LOGO_MAX_OCTETS, typeDeLogo } from "@/lib/identite";

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
  const email = texte(form.get("email")).slice(0, 120);
  if (email && !/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) retour(t("Adresse e-mail invalide."));
  await db.utilisateur.update({ where: { id: user.id }, data: { nomComplet: nom, email: email || null, emailNotifs: form.get("emailNotifs") === "on" } });
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

export async function changerMotDePasse(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const ancien = String(form.get("ancien") ?? "");
  const nouveau = String(form.get("nouveau") ?? "");
  if (!(await verifyPassword(ancien, user.motDePasse))) retour(t("Mot de passe actuel incorrect."));
  const faible = erreurMotDePasse(nouveau, user.telephone);
  if (faible) retour(t(faible));
  await db.utilisateur.update({ where: { id: user.id }, data: { motDePasse: await hashPassword(nouveau), sessionVersion: { increment: 1 } } });
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

/** Coordonnées et logo imprimés sur les contrats, mandats, bilans et quittances. */
export async function majIdentite(form: FormData) {
  const { t } = await getT();
  const { membre } = await proprietaire();
  const orgId = membre.organisationId;
  const adresse = texte(form.get("adresse")).slice(0, 160);
  const telRaw = texte(form.get("telephonePro"));
  const telephonePro = telRaw ? normalizePhone(telRaw) : null;
  if (telRaw && !telephonePro) retour(t("Numéro invalide. Exemple : 77 123 45 67"));
  const email = texte(form.get("email")).slice(0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) retour(t("Adresse e-mail invalide."));
  await db.organisation.update({ where: { id: orgId }, data: { adresse: adresse || null, telephonePro, email: email || null } });

  if (form.get("retirerLogo") === "on") await db.logoOrganisation.deleteMany({ where: { organisationId: orgId } });
  const fichier = form.get("logo");
  if (fichier instanceof File && fichier.size > 0) {
    if (fichier.size > LOGO_MAX_OCTETS) retour(t("Le logo est trop lourd (400 Ko maximum)."));
    const octets = new Uint8Array(await fichier.arrayBuffer());
    const type = typeDeLogo(octets);
    if (!type) retour(t("Le logo doit être une image PNG ou JPEG."));
    await db.logoOrganisation.upsert({
      where: { organisationId: orgId },
      create: { organisationId: orgId, octets, type: type! },
      update: { octets, type: type! },
    });
  }
  revalidatePath("/parametres");
  retour(t("Identité de vos documents mise à jour."), "ok");
}
