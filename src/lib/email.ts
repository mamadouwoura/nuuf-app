import { after } from "next/server";
import { db } from "./db";
import { appUrl } from "./quittance";

/**
 * Envoi d'e-mails (notifications). EMAIL_MODE :
 *   - "resend"     : service Resend. Requiert RESEND_API_KEY et EMAIL_FROM (ex. « Nuuf <notifications@votre-domaine.sn> ») ;
 *   - "simulation" : n'envoie rien, écrit dans la console (défaut hors production) ;
 *   - vide / autre : désactivé (défaut en production tant que rien n'est configuré).
 */
export const modeEmail = () => process.env.EMAIL_MODE ?? (process.env.NODE_ENV !== "production" ? "simulation" : "desactive");

/** Remplace les {variables} d'un modèle de texte (les e-mails sont envoyés en français). */
export const remplir = (modele: string, vars?: unknown) =>
  modele.replace(/\{(\w+)\}/g, (m, k: string) => {
    const v = vars && typeof vars === "object" ? (vars as Record<string, unknown>)[k] : undefined;
    return v === undefined || v === null ? m : String(v);
  });

export async function envoyerEmail(e: { a: string; sujet: string; texte: string }): Promise<boolean> {
  const mode = modeEmail();
  if (mode === "simulation") {
    console.log(`[email simulé] à ${e.a} — ${e.sujet}`);
    return true;
  }
  if (mode !== "resend") return false;
  const cle = process.env.RESEND_API_KEY;
  const de = process.env.EMAIL_FROM;
  if (!cle || !de) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: de, to: [e.a], subject: e.sujet, text: e.texte }),
      signal: AbortSignal.timeout(8000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Envoie par e-mail les notifications données (une seule fois chacune), aux membres qui ont renseigné leur adresse. */
export async function envoyerEmailsDes(ids: string[]): Promise<number> {
  if (ids.length === 0 || modeEmail() === "desactive") return 0;
  const lignes = await db.notification.findMany({
    where: { id: { in: ids }, emailEnvoyeLe: null, utilisateur: { email: { not: null }, emailNotifs: true } },
    include: { utilisateur: { select: { email: true, nomComplet: true } } },
  });
  let envoyes = 0;
  for (const n of lignes) {
    const email = n.utilisateur.email;
    if (!email) continue;
    const lien = n.lien ? `${appUrl()}${n.lien}` : `${appUrl()}/notifications`;
    const texte = [
      `Bonjour ${n.utilisateur.nomComplet.split(" ")[0]},`,
      "",
      n.texte ? remplir(n.texte, n.donnees) : remplir(n.titre, n.donnees),
      "",
      `Ouvrir dans Nuuf : ${lien}`,
      "",
      "Vous recevez ce message parce que les notifications par e-mail sont activées dans vos paramètres Nuuf. Vous pouvez les couper à tout moment dans Paramètres.",
    ].join("\n");
    if (await envoyerEmail({ a: email, sujet: `Nuuf : ${remplir(n.titre, n.donnees)}`, texte })) {
      await db.notification.update({ where: { id: n.id }, data: { emailEnvoyeLe: new Date() } });
      envoyes++;
    }
  }
  return envoyes;
}

/** Programme l'envoi après la réponse à l'utilisateur (hors transaction) ; sans contexte de requête, rien n'est envoyé. */
export function programmerEmails(ids: string[]) {
  if (ids.length === 0 || modeEmail() === "desactive") return;
  try {
    after(async () => {
      try {
        await envoyerEmailsDes(ids);
      } catch (e) {
        console.error("[email] envoi impossible", e instanceof Error ? e.message : e);
      }
    });
  } catch {
    /* hors requête (tests, scripts) : on n'envoie pas */
  }
}
