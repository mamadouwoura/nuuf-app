"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { envoyerMessage } from "@/lib/messagerie";
import { plafondCodesAtteint, plafondInscriptionsAtteint, tropDEchecsCode } from "@/lib/garde";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { generateOtp, hashOtp, hashPassword, normalizePhone, verifyPassword } from "@/lib/security";
import { endSession, getPendingUid, setDevOtp, setPending, startSession } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export type FormState = { error?: string } | undefined;

const MAX_ECHECS = 5;
const FENETRE = 15 * 60_000;
// Mot de passe factice : on calcule toujours un hash, que le compte existe ou non (même durée de réponse).
const FAUX_HASH = hashPassword("mot-de-passe-factice");

async function issueOtp(uid: string, telephone: string) {
  const { t } = await getT();
  // Au plus 5 codes par 10 minutes et par compte (coût d'envoi, harcèlement).
  const recents = await db.codeOtp.count({ where: { utilisateurId: uid, creeLe: { gte: new Date(Date.now() - 10 * 60_000) } } });
  if (recents >= 5 || (await plafondCodesAtteint())) {
    await setPending(uid);
    return;
  }
  const code = generateOtp();
  await db.codeOtp.create({
    data: { utilisateurId: uid, codeHash: hashOtp(code), expireLe: new Date(Date.now() + 10 * 60_000) },
  });
  await envoyerMessage({ type: "OTP", destinataire: telephone, texte: t("Nuuf : votre code de vérification est {code}. Il expire dans 10 minutes. Ne le partagez avec personne.", { code }) });
  if (process.env.NODE_ENV !== "production") console.log(`[OTP dev] ${telephone} -> ${code}`);
  await setDevOtp(code);
  await setPending(uid);
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
  const valide = user ? verifyPassword(motDePasse, user.motDePasse) : (verifyPassword(motDePasse, FAUX_HASH), false);
  if (!user || !valide) {
    await db.tentativeConnexion.create({ data: { cle: telephone } });
    return { error: t("Numéro ou mot de passe incorrect.") };
  }
  await db.tentativeConnexion.deleteMany({ where: { cle: telephone } });
  await issueOtp(user.id, telephone);
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
  if (await plafondInscriptionsAtteint()) return { error: t("Le service est très sollicité en ce moment. Réessayez dans quelques minutes.") };
  const user = await db.utilisateur.create({
    data: {
      telephone,
      nomComplet,
      motDePasse: hashPassword(motDePasse),
      membres: {
        create: {
          role: "PROPRIETAIRE",
          organisation: {
            create: {
              nom: nomComplet,
              ville,
              tailleParc,
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
  await issueOtp(user.id, telephone);
  redirect("/verification");
}

export async function verifierCode(_: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
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
  const uid = await getPendingUid();
  if (!uid) redirect("/connexion");
  const user = await db.utilisateur.findUnique({ where: { id: uid } });
  if (!user) redirect("/connexion");
  await issueOtp(user.id, user.telephone);
  redirect("/verification");
}
