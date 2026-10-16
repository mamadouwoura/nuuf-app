"use server";

import { db } from "@/lib/db";
import { endpointAutorise, pousserVers, pushConfigure } from "@/lib/push";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export type Abonnement = { endpoint: string; keys: { p256dh: string; auth: string } };
const MAX_APPAREILS = 10;
const base64url = (s: string) => /^[A-Za-z0-9_-]{16,200}$/.test(s);

/** Enregistre l'appareil (navigateur ou application installée) qui vient d'accepter les notifications. */
export async function enregistrerPush(abonnement: Abonnement, appareil: string): Promise<{ ok: boolean; erreur?: string }> {
  const { t } = await getT();
  const user = await getUser();
  if (!user) return { ok: false, erreur: t("Votre session a expiré. Reconnectez-vous.") };
  if (!pushConfigure()) return { ok: false, erreur: t("Les notifications push ne sont pas activées sur ce serveur.") };
  const { endpoint, keys } = abonnement ?? {};
  if (typeof endpoint !== "string" || !endpointAutorise(endpoint) || !keys || !base64url(String(keys.p256dh)) || !base64url(String(keys.auth))) {
    return { ok: false, erreur: t("Abonnement refusé : appareil non reconnu.") };
  }
  const existant = await db.abonnementPush.findUnique({ where: { endpoint } });
  if (!existant && (await db.abonnementPush.count({ where: { utilisateurId: user.id } })) >= MAX_APPAREILS) {
    return { ok: false, erreur: t("Nombre maximum d'appareils atteint ({n}). Désactivez-en un d'abord.", { n: MAX_APPAREILS }) };
  }
  // Un même appareil passe d'un compte à l'autre : l'abonnement suit le dernier utilisateur connecté.
  await db.abonnementPush.upsert({
    where: { endpoint },
    create: { utilisateurId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, appareil: String(appareil ?? "").slice(0, 80) || null },
    update: { utilisateurId: user.id, p256dh: keys.p256dh, auth: keys.auth, appareil: String(appareil ?? "").slice(0, 80) || null },
  });
  return { ok: true };
}

export async function retirerPush(endpoint: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user) return { ok: false };
  await db.abonnementPush.deleteMany({ where: { endpoint: String(endpoint ?? ""), utilisateurId: user.id } });
  return { ok: true };
}

/** Envoie une notification d'essai aux appareils de l'utilisateur connecté. */
export async function testerPush(): Promise<{ ok: boolean; envoyes: number; erreur?: string }> {
  const { t } = await getT();
  const user = await getUser();
  if (!user) return { ok: false, envoyes: 0, erreur: t("Votre session a expiré. Reconnectez-vous.") };
  if (!pushConfigure()) return { ok: false, envoyes: 0, erreur: t("Les notifications push ne sont pas activées sur ce serveur.") };
  const envoyes = await pousserVers(user.id, { titre: t("Nuuf : notification de test"), texte: t("Les notifications fonctionnent sur cet appareil."), lien: "/notifications", tag: "test" });
  return envoyes > 0 ? { ok: true, envoyes } : { ok: false, envoyes, erreur: t("Aucun appareil n'a reçu le test. Réactivez les notifications sur cet appareil.") };
}
