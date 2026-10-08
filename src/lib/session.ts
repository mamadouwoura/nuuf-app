import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "./db";
import { sign, verify } from "./security";

const SESSION = "nuuf_session";
const PENDING = "nuuf_pending";
const DEV_OTP = "nuuf_dev_otp";
const secure = process.env.NODE_ENV === "production";

type Token = { uid: string; exp: number };

export async function setPending(uid: string) {
  (await cookies()).set(PENDING, sign({ uid, exp: Date.now() + 10 * 60_000 }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600,
  });
}
export async function getPendingUid() {
  await connection();
  return verify<Token>((await cookies()).get(PENDING)?.value)?.uid ?? null;
}
export async function startSession(uid: string) {
  const jar = await cookies();
  jar.delete(PENDING);
  jar.delete(DEV_OTP);
  jar.set(SESSION, sign({ uid, exp: Date.now() + 30 * 86_400_000 }), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 30 * 86400,
  });
}
export async function endSession() {
  (await cookies()).delete(SESSION);
}
export async function getUser() {
  await connection();
  const uid = verify<Token>((await cookies()).get(SESSION)?.value)?.uid;
  if (!uid) return null;
  return db.utilisateur.findUnique({
    where: { id: uid },
    include: { membres: { include: { organisation: { include: { abonnement: true } } } } },
  });
}
/** Dev uniquement : le code s'affiche à l'écran au lieu d'être envoyé par WhatsApp. */
export async function setDevOtp(code: string) {
  if (secure) return;
  (await cookies()).set(DEV_OTP, code, { httpOnly: true, path: "/", maxAge: 600 });
}
export async function getDevOtp() {
  return secure ? null : ((await cookies()).get(DEV_OTP)?.value ?? null);
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
