"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { FORFAITS } from "@/lib/forfaits";
import { COOKIE_LIEN, expirationInvitation, hashJeton, invitationValide, lienInvitation, nouveauJeton } from "@/lib/invitations";
import { MODULES, modulesValides } from "@/lib/modules";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { hashPassword, normalizePhone } from "@/lib/security";
import { getUser, startSession } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const texte = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const retour = (m: string, cle: "ok" | "erreur" = "erreur"): never => redirect(`/parametres?${cle}=${encodeURIComponent(m)}#equipe`);

async function proprietaire() {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role !== "PROPRIETAIRE") retour(t("Seul le propriétaire du compte peut gérer l'équipe."));
  return { user, membre, t };
}

/** Modules cochés dans le formulaire -> modules refusés (ce qui n'est pas coché est interdit). */
function modulesRefusesDe(form: FormData) {
  const autorises = new Set(form.getAll("modules").map(String));
  return modulesValides(MODULES.map((m) => m.code)).filter((m) => !autorises.has(m));
}

async function montrerLien(jeton: string) {
  (await cookies()).set(COOKIE_LIEN, lienInvitation(jeton), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/parametres",
    maxAge: 180,
  });
}

/** Invite un collaborateur : un lien à usage unique est créé, à lui envoyer par WhatsApp. */
export async function inviterMembre(form: FormData) {
  const { user, membre, t } = await proprietaire();
  const abo = membre.organisation.abonnement;
  const max = FORFAITS[abo?.forfait ?? "DECOUVERTE"].acces;
  const maintenant = new Date();
  const [nb, enAttente] = await Promise.all([
    db.membre.count({ where: { organisationId: membre.organisationId } }),
    db.invitation.count({ where: { organisationId: membre.organisationId, accepteeLe: null, expireLe: { gt: maintenant } } }),
  ]);
  if (nb + enAttente >= max) {
    retour(max === 1 ? t("Votre forfait ne permet qu'un seul accès. Passez au forfait Pro pour ajouter votre équipe.") : t("Votre forfait est limité à {max} accès, invitations en attente comprises.", { max }));
  }
  const nom = texte(form.get("nomComplet"), 100);
  const tel = normalizePhone(texte(form.get("telephone"), 30));
  const role = texte(form.get("role"), 30) as Role;
  if (nom.length < 3) retour(t("Indiquez le nom de la personne."));
  if (!tel) retour(t("Numéro invalide. Exemple : 77 123 45 67"));
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour(t("Choisissez un rôle."));
  if (await db.utilisateur.findUnique({ where: { telephone: tel! } })) retour(t("Un compte existe déjà avec ce numéro."));

  const { jeton, hash } = nouveauJeton();
  await db.$transaction([
    // Une seule invitation en attente par numéro et par organisation : la nouvelle remplace l'ancienne.
    db.invitation.deleteMany({ where: { organisationId: membre.organisationId, telephone: tel!, accepteeLe: null } }),
    db.invitation.create({
      data: { organisationId: membre.organisationId, jetonHash: hash, nomComplet: nom, telephone: tel!, role, modulesRefuses: modulesRefusesDe(form), expireLe: expirationInvitation(maintenant) },
    }),
    db.journalAction.create({ data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "equipe.invitation", cible: tel! } }),
  ]);
  await montrerLien(jeton);
  revalidatePath("/parametres");
  retour(t("Invitation créée pour {nom} : envoyez-lui le lien ci-dessous.", { nom }), "ok");
}

/** Génère un nouveau lien pour une invitation en attente (l'ancien cesse de fonctionner). */
export async function renouvelerInvitation(form: FormData) {
  const { membre, t } = await proprietaire();
  const inv = await db.invitation.findFirst({ where: { id: texte(form.get("id"), 40), organisationId: membre.organisationId, accepteeLe: null } });
  if (!inv) retour(t("Invitation introuvable."));
  const { jeton, hash } = nouveauJeton();
  await db.invitation.update({ where: { id: inv!.id }, data: { jetonHash: hash, expireLe: expirationInvitation() } });
  await montrerLien(jeton);
  revalidatePath("/parametres");
  retour(t("Nouveau lien créé pour {nom}.", { nom: inv!.nomComplet }), "ok");
}

export async function annulerInvitation(form: FormData) {
  const { membre, t } = await proprietaire();
  await db.invitation.deleteMany({ where: { id: texte(form.get("id"), 40), organisationId: membre.organisationId, accepteeLe: null } });
  revalidatePath("/parametres");
  retour(t("Invitation annulée."), "ok");
}

/** Change le rôle d'un collaborateur et les modules auxquels il a accès. */
export async function modifierAcces(form: FormData) {
  const { user, membre, t } = await proprietaire();
  const role = texte(form.get("role"), 30) as Role;
  if (role !== "GESTIONNAIRE" && role !== "LECTURE_SEULE") retour(t("Rôle invalide."));
  const r = await db.membre.updateMany({
    where: { id: texte(form.get("membreId"), 40), organisationId: membre.organisationId, role: { not: "PROPRIETAIRE" } },
    data: { role, modulesRefuses: modulesRefusesDe(form) },
  });
  if (r.count > 0) await db.journalAction.create({ data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "equipe.acces", cible: texte(form.get("membreId"), 40) } });
  revalidatePath("/parametres");
  retour(t("Accès mis à jour."), "ok");
}

const FENETRE = 15 * 60_000;
const MAX_ECHECS = 5;

/** Crée le compte du collaborateur depuis le lien reçu : le numéro doit correspondre à celui de l'invitation. */
export async function accepterInvitation(form: FormData) {
  const { t } = await getT();
  const jeton = texte(form.get("jeton"), 100);
  const ici = (m: string): never => redirect(`/invitation/${jeton}?erreur=${encodeURIComponent(m)}`);
  const inv = await db.invitation.findUnique({ where: { jetonHash: hashJeton(jeton) } });
  if (!inv || !invitationValide(inv)) return ici(t("Cette invitation n'est plus valable. Demandez un nouveau lien."));

  // Le numéro sert de seconde vérification : on limite les essais par invitation.
  const cle = `invitation:${inv.id}`;
  const echecs = await db.tentativeConnexion.count({ where: { cle, creeLe: { gte: new Date(Date.now() - FENETRE) } } });
  if (echecs >= MAX_ECHECS) return ici(t("Trop de tentatives. Réessayez dans 15 minutes."));
  const tel = normalizePhone(texte(form.get("telephone"), 30));
  if (!tel || tel !== inv.telephone) {
    await db.tentativeConnexion.create({ data: { cle } });
    return ici(t("Ce numéro ne correspond pas à l'invitation."));
  }
  const mdp = String(form.get("motDePasse") ?? "");
  if (mdp !== String(form.get("confirmation") ?? "")) return ici(t("Les deux mots de passe ne sont pas identiques."));
  const faible = erreurMotDePasse(mdp, tel);
  if (faible) return ici(t(faible));
  if (await db.utilisateur.findUnique({ where: { telephone: tel } })) return ici(t("Un compte existe déjà avec ce numéro."));

  const motDePasse = await hashPassword(mdp);
  const cree = await db.$transaction(async (tx) => {
    // Marquer l'invitation comme utilisée d'abord : un double envoi ne crée jamais deux comptes.
    const pris = await tx.invitation.updateMany({ where: { id: inv.id, accepteeLe: null }, data: { accepteeLe: new Date() } });
    if (pris.count === 0) return null;
    const u = await tx.utilisateur.create({
      data: {
        telephone: tel,
        nomComplet: inv.nomComplet,
        motDePasse,
        membres: { create: { organisationId: inv.organisationId, role: inv.role, modulesRefuses: inv.modulesRefuses } },
      },
    });
    await tx.journalAction.create({ data: { organisationId: inv.organisationId, utilisateurId: u.id, action: "equipe.invitation_acceptee", cible: inv.id } });
    return u;
  });
  if (!cree) return ici(t("Cette invitation n'est plus valable. Demandez un nouveau lien."));
  await startSession(cree.id);
  redirect("/tableau-de-bord");
}
