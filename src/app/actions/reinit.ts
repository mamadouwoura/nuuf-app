"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { envoyerMessage } from "@/lib/messagerie";
import { plafondCodesAtteint, tropDEchecsCode } from "@/lib/garde";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { generateOtp, hashOtp, hashPassword, normalizePhone } from "@/lib/security";
import { lireJeton, poserJeton, retirerJeton, setDevOtp } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const PAGE = "/mot-de-passe-oublie";
const vers = (etape: number, erreur?: string): never =>
  redirect(`${PAGE}?etape=${etape}${erreur ? `&erreur=${encodeURIComponent(erreur)}` : ""}`);

/** Étape 1 : envoie un code. La réponse est identique que le numéro existe ou non. */
export async function demanderReinitialisation(form: FormData) {
  const { t } = await getT();
  const tel = normalizePhone(String(form.get("telephone") ?? ""));
  if (!tel) vers(1, t("Numéro invalide. Exemple : 77 123 45 67"));
  const user = await db.utilisateur.findUnique({ where: { telephone: tel! } });
  if (user) {
    const recents = await db.codeOtp.count({ where: { utilisateurId: user.id, creeLe: { gte: new Date(Date.now() - 10 * 60_000) } } });
    if (recents < 3 && !(await plafondCodesAtteint())) {
      const code = generateOtp();
      await db.codeOtp.create({ data: { utilisateurId: user.id, codeHash: hashOtp(code), expireLe: new Date(Date.now() + 10 * 60_000) } });
      await envoyerMessage({ type: "OTP", destinataire: tel!, texte: t("Nuuf : votre code pour réinitialiser le mot de passe est {code}. Il expire dans 10 minutes. Ne le partagez avec personne.", { code }) });
      if (process.env.NODE_ENV !== "production") console.log(`[OTP dev] réinitialisation ${tel} -> ${code}`);
      await setDevOtp(code);
    }
  }
  await poserJeton("nuuf_reinit", user?.id ?? "inconnu");
  await poserJeton("nuuf_reinit_tel", tel!);
  vers(2);
}

/** Étape 2 : vérifie le code reçu. */
export async function verifierCodeReinit(form: FormData) {
  const { t } = await getT();
  const uid = await lireJeton("nuuf_reinit");
  if (!uid) vers(1, t("Session expirée. Recommencez."));
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  const otp = uid === "inconnu" ? null : await db.codeOtp.findFirst({
    where: { utilisateurId: uid!, utiliseLe: null, expireLe: { gt: new Date() } },
    orderBy: { creeLe: "desc" },
  });
  if (uid !== "inconnu" && (await tropDEchecsCode(uid!))) vers(2, t("Trop d'essais. Réessayez dans une heure."));
  if (!otp || otp.tentatives >= 5) vers(2, t("Code incorrect ou expiré."));
  if (otp!.codeHash !== hashOtp(code)) {
    await db.codeOtp.update({ where: { id: otp!.id }, data: { tentatives: { increment: 1 } } });
    vers(2, t("Code incorrect."));
  }
  await db.codeOtp.update({ where: { id: otp!.id }, data: { utiliseLe: new Date() } });
  await retirerJeton("nuuf_reinit");
  await poserJeton("nuuf_reinit_ok", uid!);
  vers(3);
}

/** Étape 3 : enregistre le nouveau mot de passe. */
export async function nouveauMotDePasse(form: FormData) {
  const { t } = await getT();
  const uid = await lireJeton("nuuf_reinit_ok");
  if (!uid) vers(1, t("Session expirée. Recommencez."));
  const a = String(form.get("motDePasse") ?? "");
  const b = String(form.get("confirmation") ?? "");
  const faible = erreurMotDePasse(a, await lireJeton("nuuf_reinit_tel"));
  if (faible) vers(3, t(faible));
  if (a !== b) vers(3, t("Les deux mots de passe ne correspondent pas."));
  await db.utilisateur.update({ where: { id: uid! }, data: { motDePasse: await hashPassword(a), sessionVersion: { increment: 1 } } });
  await retirerJeton("nuuf_reinit_ok");
  await retirerJeton("nuuf_reinit_tel");
  redirect("/connexion?info=" + encodeURIComponent(t("Mot de passe modifié. Vous pouvez vous connecter.")));
}
