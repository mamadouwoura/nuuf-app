import type { CanalMessage, TypeMessage } from "@prisma/client";
import { db } from "./db";

/**
 * Envoi de messages sortants (WhatsApp / SMS).
 * MESSAGERIE_MODE :
 *   - "simulation"      : n'envoie rien, écrit dans la console (défaut hors production) ;
 *   - "whatsapp_cloud"  : API WhatsApp Business Cloud (Meta). Requiert WHATSAPP_TOKEN et WHATSAPP_PHONE_ID ;
 *                         hors fenêtre de 24 h, Meta impose des modèles approuvés (WHATSAPP_TEMPLATE_<TYPE>) ;
 *   - vide / autre      : désactivé — le message est tracé « NON_ENVOYE » (défaut en production).
 */
export const modeMessagerie = () =>
  process.env.MESSAGERIE_MODE ?? (process.env.NODE_ENV !== "production" ? "simulation" : "desactive");

export type Envoi = {
  canal?: CanalMessage;
  type: TypeMessage;
  destinataire: string;
  texte: string;
  organisationId?: string | null;
};

async function viaWhatsAppCloud(e: Envoi): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;
  const modele = process.env[`WHATSAPP_TEMPLATE_${e.type}`];
  const corps = modele
    ? {
        type: "template",
        template: {
          name: modele,
          language: { code: "fr" },
          components: [{ type: "body", parameters: [{ type: "text", text: e.texte }] }],
        },
      }
    : { type: "text", text: { body: e.texte } };
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: e.destinataire.replace(/\D/g, ""), ...corps }),
      signal: AbortSignal.timeout(10_000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Envoie un message et garde sa trace. Retourne vrai si le message est réellement parti. */
export async function envoyerMessage(e: Envoi): Promise<boolean> {
  const mode = modeMessagerie();
  let parti = false;
  let statut = "NON_ENVOYE";
  if (mode === "simulation") {
    // Les codes de vérification ne sont jamais écrits dans les journaux d'un serveur réel.
    if (process.env.NODE_ENV !== "production") console.log(`[message ${e.type}] ${e.destinataire} : ${e.texte}`);
    statut = "SIMULE";
  } else if (mode === "whatsapp_cloud") {
    parti = await viaWhatsAppCloud(e);
    statut = parti ? "ENVOYE" : "ECHEC";
  }
  await db.message.create({
    data: { organisationId: e.organisationId ?? null, canal: e.canal ?? "WHATSAPP", type: e.type, destinataire: e.destinataire, statut },
  });
  return parti;
}
