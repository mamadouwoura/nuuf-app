"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { envoyerMessage, modeMessagerie } from "@/lib/messagerie";
import { plafondCodesAtteint, plafondInscriptionsAtteint, tropDEchecsCode } from "@/lib/garde";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { estAdmin } from "@/lib/admin";
import { generateOtp, hashOtp, hashPassword, normalizePhone, verifyPassword } from "@/lib/security";
import { codeAffiche, endSession, getPendingInscription, getPendingUid, setDevOtp, setPending, setPendingInscription, startSession } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export type FormState = { error?: string } | undefined;

const MAX_ECHECS = 5;
const FENETRE = 15 * 60_000;
// Mot de passe factice : on calcule toujours un hash, que le compte existe ou non (même durée de réponse).
const FAUX_HASH = hashPassword("mot-de-passe-factice"); // promesse : calculée une fois, attendue au besoin

/** Crée et envoie un code. Retourne faux quand le code n'a réellement pas pu partir (WhatsApp en échec ou non configuré). */
async function issueOtp(uid: string, telephone: string): Promise<boolean> {
  const { t } = await getT();
  // Au plus 5 codes par 10 minutes et par compte (coût d'envoi, harcèlement).
  const recents = await db.codeOtp.count({ where: { utilisateurId: uid, creeLe: { gte: new Date(Date.now() - 10 * 60_000) } } });
  if (recents >= 5 || (await plafondCodesAtteint())) {
    await setPending(uid);
    return true; // plafond atteint : l'utilisateur utilise l'un de ses codes récents
  }
  const code = generateOtp();
  await db.codeOtp.create({
    data: { utilisateurId: uid, codeHash: hashOtp(code), expireLe: new Date(Date.now() + 10 * 60_000) },
  });
  const parti = await envoyerMessage({ type: "OTP", destinataire: telephone, texte: t("Nuuf : votre code de vérification est {code}. Il expire dans 10 minutes. Ne le partagez avec personne.", { code }) });
  if (process.env.NODE_ENV !== "production") console.log(`[OTP dev] ${telephone} -> ${code}`);
  await setDevOtp(code);
  await setPending(uid);
  return parti || modeMessagerie() === "simulation" || codeAffiche();
}

export async function connexion(_: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const telephone = normalizePhone(String(form.get("telephone") ?? ""));
  const motDePasse = String(form.get("motDePasse") ?? "");
  if (!telephone) return { error: t("Numéro invalide. Exemple : 77 123 45 67") };
  const depuis = new Date(Date.now() - FENETRE);
  const echecs = await db.tentativeConnexion.count({ where: { cle: telephone, creeLe: { gte: depuis } } });
  if (echecs >= MAX_ECHECS) return { error: t("Trop de tentatives. Réessayez dans 15 minutes ou réinitialisez votre mot de passe.") };

  const user = await db.utilisateur.findUnique({ where: { telephone } });
  const valide = user ? await verifyPassword(motDePasse, user.motDePasse) : (await verifyPassword(motDePasse, await FAUX_HASH), false);
  if (!user || !valide) {
    await db.tentativeConnexion.create({ data: { cle: telephone } });
    return { error: t("Numéro ou mot de passe incorrect.") };
  }
  await db.tentativeConnexion.deleteMany({ where: { cle: telephone } });
  if (!(await issueOtp(user.id, telephone))) {
    return { error: t("Le code n'a pas pu être envoyé. Réessayez dans un instant ou contactez l'assistance.") };
  }
  redirect("/verification");
}

export async function inscription(_: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const nomComplet = String(form.get("nomComplet") ?? "").trim();
  const telephone = normalizePhone(String(form.get("telephone") ?? ""));
  const motDePasse = String(form.get("motDePasse") ?? "");
  const ville = ["Dakar", "Thiès", "Mbour", "Autre"].find((v) => v === form.get("ville")) ?? null;
  const tailleParc = ["1-5", "6-20", "21-50", "50+"].find((v) => v === form.get("tailleParc")) ?? null;
  if (nomComplet.length < 3) return { error: t("Indiquez votre prénom et nom.") };
  if (!telephone) return { error: t("Numéro invalide. Exemple : 77 123 45 67") };
  const faible = erreurMotDePasse(motDePasse, telephone);
  if (faible) return { error: t(faible) };
  if (await db.utilisateur.findUnique({ where: { telephone } })) {
    return { error: t("Un compte existe déjà avec ce numéro.") };
  }
  if ((await plafondInscriptionsAtteint()) || (await plafondCodesAtteint())) {
    return { error: t("Le service est très sollicité en ce moment. Réessayez dans quelques minutes.") };
  }
  // Aucun compte n'est créé tant que le code reçu sur le téléphone n'a pas été saisi : on ne peut pas
  // inscrire le numéro de quelqu'un d'autre ni l'empêcher de s'inscrire lui-même.
  const code = generateOtp();
  const attente = await db.$transaction(async (tx) => {
    await tx.inscriptionEnAttente.deleteMany({ where: { expireLe: { lt: new Date() } } });
    const valeurs = { nomComplet, motDePasse: await hashPassword(motDePasse), ville, tailleParc, codeHash: hashOtp(code), expireLe: new Date(Date.now() + 10 * 60_000) };
    return tx.inscriptionEnAttente.upsert({
      where: { telephone },
      create: { telephone, ...valeurs },
      update: { ...valeurs, tentatives: 0, envois: 1, creeLe: new Date() },
    });
  });
  const parti = await envoyerMessage({ type: "OTP", destinataire: telephone, texte: t("Nuuf : votre code de vérification est {code}. Il expire dans 10 minutes. Ne le partagez avec personne.", { code }) });
  if (process.env.NODE_ENV !== "production") console.log(`[OTP dev] ${telephone} -> ${code}`);
  await setDevOtp(code);
  await setPendingInscription(attente.id);
  if (!(parti || modeMessagerie() === "simulation" || codeAffiche())) {
    return { error: t("Le code n'a pas pu être envoyé. Réessayez dans un instant ou contactez l'assistance.") };
  }
  redirect("/verification");
}

/** Crée le compte une fois le code de l'inscription validé. */
async function confirmerInscription(id: string, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const a = await db.inscriptionEnAttente.findUnique({ where: { id } });
  if (!a || a.expireLe < new Date() || a.tentatives >= 5) {
    return { error: t("Code expiré. Recommencez l'inscription pour en recevoir un nouveau.") };
  }
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  if (a.codeHash !== hashOtp(code)) {
    await db.inscriptionEnAttente.update({ where: { id }, data: { tentatives: { increment: 1 } } });
    return { error: t("Code incorrect.") };
  }
  if (await db.utilisateur.findUnique({ where: { telephone: a.telephone } })) {
    await db.inscriptionEnAttente.delete({ where: { id } }).catch(() => {});
    return { error: t("Un compte existe déjà avec ce numéro.") };
  }
  const user = await db.utilisateur.create({
    data: {
      telephone: a.telephone,
      nomComplet: a.nomComplet,
      motDePasse: a.motDePasse,
      telVerifieLe: new Date(),
      membres: {
        create: {
          role: "PROPRIETAIRE",
          organisation: {
            create: {
              nom: a.nomComplet,
              ville: a.ville,
              tailleParc: a.tailleParc,
              abonnement: {
                create: {
                  forfait: "DECOUVERTE",
                  statut: "ESSAI",
                  essaiFinLe: new Date(Date.now() + 14 * 86_400_000),
                },
              },
            },
          },
        },
      },
    },
  });
  await db.inscriptionEnAttente.delete({ where: { id } }).catch(() => {});
  await startSession(user.id);
  redirect(estAdmin(a.telephone) ? "/admin" : "/bienvenue");
}

export async function verifierCode(_: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const inscriptionId = await getPendingInscription();
  if (inscriptionId) return confirmerInscription(inscriptionId, form);
  const uid = await getPendingUid();
  if (!uid) redirect("/connexion");
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  const otp = await db.codeOtp.findFirst({
    where: { utilisateurId: uid, utiliseLe: null, expireLe: { gt: new Date() } },
    orderBy: { creeLe: "desc" },
  });
  if (await tropDEchecsCode(uid)) return { error: t("Trop d'essais. Réessayez dans une heure.") };
  if (!otp || otp.tentatives >= 5) return { error: t("Code expiré. Reconnectez-vous pour en recevoir un nouveau.") };
  if (otp.codeHash !== hashOtp(code)) {
    await db.codeOtp.update({ where: { id: otp.id }, data: { tentatives: { increment: 1 } } });
    return { error: t("Code incorrect.") };
  }
  await db.codeOtp.update({ where: { id: otp.id }, data: { utiliseLe: new Date() } });
  await db.utilisateur.update({ where: { id: uid }, data: { telVerifieLe: new Date() } });
  await startSession(uid);
  const connecte = await db.utilisateur.findUnique({ where: { id: uid }, select: { telephone: true } });
  if (connecte && estAdmin(connecte.telephone)) redirect("/admin");
  const nbBiens = await db.bien.count({ where: { organisation: { membres: { some: { utilisateurId: uid } } }, archiveLe: null } });
  redirect(nbBiens === 0 ? "/bienvenue" : "/tableau-de-bord");
}

export async function deconnexion() {
  await endSession();
  redirect("/connexion");
}

// Variantes « formulaire HTML » : l'erreur repasse par l'URL (écrans portés des maquettes).
const retour = (page: string, e?: string) => `${page}?erreur=${encodeURIComponent(e ?? "")}`;

export async function connexionForm(form: FormData) {
  const r = await connexion(undefined, form);
  if (r?.error) redirect(retour("/connexion", r.error));
}
export async function inscriptionForm(form: FormData) {
  const r = await inscription(undefined, form);
  if (r?.error) redirect(retour("/inscription", r.error));
}
export async function verifierCodeForm(form: FormData) {
  const r = await verifierCode(undefined, form);
  if (r?.error) redirect(retour("/verification", r.error));
}

/** Renvoie un code de vérification au compte en cours de connexion (limité à 5 codes / 10 min). */
export async function renvoyerCode() {
  const inscriptionId = await getPendingInscription();
  if (inscriptionId) {
    const { t } = await getT();
    const a = await db.inscriptionEnAttente.findUnique({ where: { id: inscriptionId } });
    if (!a) redirect("/inscription");
    if (a!.envois >= 5 || (await plafondCodesAtteint())) {
      redirect(retour("/verification", t("Trop de codes demandés. Réessayez plus tard.")));
    }
    const code = generateOtp();
    await db.inscriptionEnAttente.update({
      where: { id: inscriptionId },
      data: { codeHash: hashOtp(code), expireLe: new Date(Date.now() + 10 * 60_000), tentatives: 0, envois: { increment: 1 } },
    });
    const parti = await envoyerMessage({ type: "OTP", destinataire: a!.telephone, texte: t("Nuuf : votre code de vérification est {code}. Il expire dans 10 minutes. Ne le partagez avec personne.", { code }) });
    if (process.env.NODE_ENV !== "production") console.log(`[OTP dev] ${a!.telephone} -> ${code}`);
    await setDevOtp(code);
    if (!(parti || modeMessagerie() === "simulation" || codeAffiche())) {
      redirect(retour("/verification", t("Le code n'a pas pu être envoyé. Réessayez dans un instant.")));
    }
    redirect("/verification");
  }
  const uid = await getPendingUid();
  if (!uid) redirect("/connexion");
  const user = await db.utilisateur.findUnique({ where: { id: uid } });
  if (!user) redirect("/connexion");
  const { t } = await getT();
  if (!(await issueOtp(user.id, user.telephone))) {
    redirect(`/verification?erreur=${encodeURIComponent(t("Le code n'a pas pu être envoyé. Réessayez dans un instant."))}`);
  }
  redirect("/verification");
}
