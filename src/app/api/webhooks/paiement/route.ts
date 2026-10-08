import { createHmac, timingSafeEqual } from "node:crypto";
import { appliquerResultat } from "@/lib/passerelle";

/**
 * Webhook des opérateurs (Wave / Orange Money).
 * Corps JSON : { "reference": "...", "statut": "CONFIRME" | "ECHEC" }
 * En-tête `x-nuuf-signature` : HMAC-SHA256 hexadécimal du corps avec PAIEMENT_WEBHOOK_SECRET.
 * (À adapter au format exact de chaque opérateur lors du branchement réel.)
 */
export async function POST(req: Request) {
  const secret = process.env.PAIEMENT_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook non configuré", { status: 503 });
  const corps = await req.text();
  const attendu = createHmac("sha256", secret).update(corps).digest();
  const recu = Buffer.from(req.headers.get("x-nuuf-signature") ?? "", "hex");
  if (recu.length !== attendu.length || !timingSafeEqual(recu, attendu)) {
    return new Response("Signature invalide", { status: 401 });
  }
  let data: { reference?: string; statut?: string };
  try {
    data = JSON.parse(corps);
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }
  if (!data.reference || (data.statut !== "CONFIRME" && data.statut !== "ECHEC")) {
    return new Response("Paramètres invalides", { status: 400 });
  }
  const r = await appliquerResultat(data.reference, data.statut);
  return r ? Response.json({ ok: true }) : new Response("Référence inconnue", { status: 404 });
}
