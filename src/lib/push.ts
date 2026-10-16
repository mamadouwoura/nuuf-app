import webpush from "web-push";
import { after } from "next/server";
import { db } from "./db";
import { remplir } from "./email";

/**
 * Notifications push (Web Push, VAPID). Désactivées tant que VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY et VAPID_SUBJECT
 * (« mailto:contact@votre-domaine ») ne sont pas renseignés. Les clés se génèrent avec `npm run vapid`.
 */
export const pushConfigure = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
export const clePubliquePush = () => process.env.VAPID_PUBLIC_KEY ?? null;

/** Un appareil ne peut être enregistré que chez les services push des navigateurs : jamais une adresse arbitraire. */
const SERVICES = [/(^|\.)googleapis\.com$/, /(^|\.)mozilla\.com$/, /(^|\.)windows\.com$/, /(^|\.)apple\.com$/, /(^|\.)push\.services\.mozilla\.com$/];
export function endpointAutorise(brut: string) {
  try {
    const u = new URL(brut);
    return u.protocol === "https:" && brut.length <= 600 && SERVICES.some((r) => r.test(u.hostname));
  } catch {
    return false;
  }
}

let initialise = false;
function preparer() {
  if (initialise) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  initialise = true;
}

export type Charge = { titre: string; texte?: string; lien?: string; tag?: string };

/** Envoie une charge à tous les appareils d'un utilisateur ; supprime ceux que le service push déclare disparus (404/410). */
export async function pousserVers(utilisateurId: string, charge: Charge): Promise<number> {
  if (!pushConfigure()) return 0;
  preparer();
  const appareils = await db.abonnementPush.findMany({ where: { utilisateurId } });
  let envoyes = 0;
  for (const a of appareils) {
    try {
      await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(charge), { TTL: 3600, timeout: 8000 });
      envoyes++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.abonnementPush.deleteMany({ where: { id: a.id } });
      else console.error("[push] envoi impossible", code ?? (e instanceof Error ? e.message : e));
    }
  }
  return envoyes;
}

/** Pousse les notifications données vers les appareils des destinataires (texte en français). */
export async function pousserDes(ids: string[]): Promise<number> {
  if (ids.length === 0 || !pushConfigure()) return 0;
  const lignes = await db.notification.findMany({ where: { id: { in: ids } }, select: { id: true, utilisateurId: true, titre: true, texte: true, donnees: true, lien: true } });
  let total = 0;
  for (const n of lignes) {
    total += await pousserVers(n.utilisateurId, {
      titre: remplir(n.titre, n.donnees),
      texte: n.texte ? remplir(n.texte, n.donnees) : undefined,
      lien: n.lien ?? "/notifications",
      tag: n.id,
    });
  }
  return total;
}

/** Programme l'envoi après la réponse à l'utilisateur ; hors requête (tests, scripts), rien n'est envoyé. */
export function programmerPush(ids: string[]) {
  if (ids.length === 0 || !pushConfigure()) return;
  try {
    after(async () => {
      try {
        await pousserDes(ids);
      } catch (e) {
        console.error("[push] envoi impossible", e instanceof Error ? e.message : e);
      }
    });
  } catch {
    /* hors requête */
  }
}
