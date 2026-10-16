import { randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "./db";
import { sign, verify } from "./security";
import { ACTIVITE_RAFRAICHIE_MS, estVerrouillee } from "./pin";

const SESSION = "nuuf_session";
const PENDING = "nuuf_pending";
const DEV_OTP = "nuuf_dev_otp";
const secure = process.env.NODE_ENV === "production";
/** Démonstration : le code de connexion s'affiche à l'écran, même en production (NUUF_DEMO=1). Jamais pour de vrais clients. */
const afficheCode = !secure || process.env.NUUF_DEMO === "1";
/** Vrai quand le code est montré à l'écran (développement, démonstration) : aucun envoi n'est alors nécessaire. */
export const codeAffiche = () => afficheCode;

type Token = { uid?: string; ins?: string; exp: number; v?: number; sid?: string };

export async function setPending(uid: string) {
  (await cookies()).set(PENDING, sign({ uid, exp: Date.now() + 10 * 60_000 }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600,
  });
}
export async function getPendingUid() {
  await connection();
  return verify<Token>((await cookies()).get(PENDING)?.value)?.uid ?? null;
}
/** Inscription en attente de confirmation du code (aucun compte n'existe encore). */
export async function setPendingInscription(id: string) {
  (await cookies()).set(PENDING, sign({ ins: id, exp: Date.now() + 10 * 60_000 }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600,
  });
}
export async function getPendingInscription() {
  await connection();
  return verify<Token>((await cookies()).get(PENDING)?.value)?.ins ?? null;
}
export async function startSession(uid: string) {
  const u = await db.utilisateur.findUnique({ where: { id: uid }, select: { sessionVersion: true } });
  const jar = await cookies();
  jar.delete(PENDING);
  jar.delete(DEV_OTP);
  // La session existe côté serveur : se déconnecter la supprime, même si le cookie a été copié ailleurs.
  const sid = randomBytes(24).toString("hex");
  const expireLe = new Date(Date.now() + 30 * 86_400_000);
  await db.sessionUtilisateur.deleteMany({ where: { utilisateurId: uid, expireLe: { lt: new Date() } } });
  await db.sessionUtilisateur.create({ data: { id: sid, utilisateurId: uid, expireLe } });
  jar.set(SESSION, sign({ uid, v: u?.sessionVersion ?? 0, sid, exp: expireLe.getTime() }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 30 * 86400,
  });
}
export async function endSession() {
  const jar = await cookies();
  const jeton = verify<Token>(jar.get(SESSION)?.value);
  if (jeton?.sid) await db.sessionUtilisateur.deleteMany({ where: { id: jeton.sid } });
  jar.delete(SESSION);
}
/**
 * Session en cours : l'utilisateur et l'état de verrouillage. Une seule lecture en base par requête.
 * Une session verrouillée (PIN demandé après inactivité) n'est reconnue que par l'écran de déverrouillage.
 */
const chargerSession = cache(async function chargerSession() {
  await connection();
  const jeton = verify<Token>((await cookies()).get(SESSION)?.value);
  if (!jeton?.uid || !jeton.sid) return null;
  const user = await db.utilisateur.findUnique({
    where: { id: jeton.uid },
    include: {
      membres: { include: { organisation: { include: { abonnement: true } } } },
      sessions: { where: { id: jeton.sid, expireLe: { gt: new Date() } }, select: { id: true, activiteLe: true } },
    },
  });
  // Session supprimée (déconnexion) ou mot de passe changé depuis son ouverture : elle n'est plus valable.
  if (!user || user.sessions.length === 0 || user.sessionVersion !== (jeton.v ?? 0)) return null;
  const session = user.sessions[0];
  const now = new Date();
  const verrouillee = estVerrouillee(user, session.activiteLe, now);
  // Avec un PIN, on note le passage (au plus une fois par minute) pour mesurer l'inactivité.
  if (user.pinHash && !verrouillee && now.getTime() - session.activiteLe.getTime() > ACTIVITE_RAFRAICHIE_MS) {
    await db.sessionUtilisateur.updateMany({ where: { id: session.id }, data: { activiteLe: now } }).catch(() => {});
  }
  return { user, sessionId: session.id, verrouillee };
});

/** Utilisateur connecté et déverrouillé ; null si la session est absente, expirée ou verrouillée. */
export const getUser = cache(async function getUser() {
  const s = await chargerSession();
  return s && !s.verrouillee ? s.user : null;
});

/** Pour l'écran de déverrouillage et la mise en page : l'utilisateur même si le PIN est demandé. */
export async function getUserMemeVerrouille() {
  return chargerSession();
}

/** Dev uniquement : le code s'affiche à l'écran au lieu d'être envoyé par WhatsApp. */
export async function setDevOtp(code: string) {
  if (!afficheCode) return;
  (await cookies()).set(DEV_OTP, code, { httpOnly: true, secure, path: "/", maxAge: 600 });
}
export async function getDevOtp() {
  return afficheCode ? ((await cookies()).get(DEV_OTP)?.value ?? null) : null;
}

/** Petits jetons signés à courte durée de vie (étapes de réinitialisation du mot de passe). */
export async function poserJeton(nom: string, uid: string, minutes = 10) {
  (await cookies()).set(nom, sign({ uid, exp: Date.now() + minutes * 60_000 }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: minutes * 60,
  });
}
export async function lireJeton(nom: string) {
  await connection();
  return verify<Token>((await cookies()).get(nom)?.value)?.uid ?? null;
}
export async function retirerJeton(nom: string) {
  (await cookies()).delete(nom);
}
