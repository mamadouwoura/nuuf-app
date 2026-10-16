"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { DELAIS_VERROUILLAGE, FENETRE_PIN_MS, MAX_ECHECS_PIN, problemePin } from "@/lib/pin";
import { hashPassword, verifyPassword } from "@/lib/security";
import { endSession, getUser, getUserMemeVerrouille } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const texte = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const retour = (m: string, cle: "ok" | "erreur" = "erreur"): never => redirect(`/parametres?${cle}=${encodeURIComponent(m)}#pin`);
const interne = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return /^\/(?!\/)[\w\-/?=&%.]*$/.test(s) && !s.startsWith("/verrouillage") ? s : "/tableau-de-bord"; // chemin interne uniquement
};

/** Active ou change le code PIN (le mot de passe actuel est exigé). */
export async function definirPin(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const pin = texte(form.get("pin"), 10);
  if (pin !== texte(form.get("confirmation"), 10)) retour(t("Les deux codes PIN ne sont pas identiques."));
  const p = problemePin(pin);
  if (p === "format") retour(t("Le code PIN doit comporter 4 à 6 chiffres."));
  if (p === "faible") retour(t("Ce code PIN est trop simple (suite ou chiffres répétés). Choisissez-en un moins prévisible."));
  if (!(await verifyPassword(String(form.get("motDePasse") ?? ""), user.motDePasse))) retour(t("Mot de passe actuel incorrect."));
  const delai = Number(form.get("delai"));
  await db.utilisateur.update({
    where: { id: user.id },
    data: { pinHash: await hashPassword(pin), pinDefiniLe: new Date(), verrouillageMin: (DELAIS_VERROUILLAGE as readonly number[]).includes(delai) ? delai : 10 },
  });
  revalidatePath("/parametres");
  retour(t("Code PIN enregistré. L'application se verrouillera après une période d'inactivité."), "ok");
}

export async function reglerVerrouillage(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const delai = Number(form.get("delai"));
  if (!(DELAIS_VERROUILLAGE as readonly number[]).includes(delai)) retour(t("Délai invalide."));
  await db.utilisateur.update({ where: { id: user.id }, data: { verrouillageMin: delai } });
  revalidatePath("/parametres");
  retour(t("Délai de verrouillage mis à jour."), "ok");
}

export async function retirerPin(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  if (!(await verifyPassword(String(form.get("motDePasse") ?? ""), user.motDePasse))) retour(t("Mot de passe actuel incorrect."));
  await db.utilisateur.update({ where: { id: user.id }, data: { pinHash: null, pinDefiniLe: null } });
  revalidatePath("/parametres");
  retour(t("Code PIN retiré."), "ok");
}

/** Verrouille tout de suite l'application sur cet appareil. */
export async function verrouillerMaintenant() {
  const s = await getUserMemeVerrouille();
  if (!s) redirect("/connexion");
  if (s.user.pinHash) await db.sessionUtilisateur.updateMany({ where: { id: s.sessionId }, data: { activiteLe: new Date(0) } });
  redirect(s.user.pinHash ? "/verrouillage" : "/tableau-de-bord");
}

/** Saisie du PIN sur l'écran de verrouillage : 5 erreurs en 15 minutes ferment la session. */
export async function deverrouiller(form: FormData) {
  const { t } = await getT();
  const s = await getUserMemeVerrouille();
  if (!s) redirect("/connexion");
  const suite = interne(form.get("suite"));
  if (!s.verrouillee || !s.user.pinHash) redirect(suite);
  const ici = (m: string): never => redirect(`/verrouillage?erreur=${encodeURIComponent(m)}&suite=${encodeURIComponent(suite)}`);
  const cle = `pin:${s.user.id}`;
  const echecs = await db.tentativeConnexion.count({ where: { cle, creeLe: { gte: new Date(Date.now() - FENETRE_PIN_MS) } } });
  if (echecs >= MAX_ECHECS_PIN) {
    await endSession();
    redirect(`/connexion?erreur=${encodeURIComponent(t("Trop d'erreurs de code PIN : reconnectez-vous avec votre mot de passe."))}`);
  }
  if (!(await verifyPassword(texte(form.get("pin"), 10), s.user.pinHash))) {
    await db.tentativeConnexion.create({ data: { cle } });
    return ici(t("Code PIN incorrect. Il vous reste {n} essai(s).", { n: Math.max(0, MAX_ECHECS_PIN - echecs - 1) }));
  }
  await db.$transaction([
    db.tentativeConnexion.deleteMany({ where: { cle } }),
    db.sessionUtilisateur.updateMany({ where: { id: s.sessionId }, data: { activiteLe: new Date() } }),
  ]);
  redirect(suite);
}
