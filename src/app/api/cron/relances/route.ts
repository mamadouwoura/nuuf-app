import { timingSafeEqual } from "node:crypto";
import { lancerRelancesAutomatiques } from "@/lib/relances-auto";
import { purgerDonneesPeriodiques } from "@/lib/garde";

/** Appelée chaque jour par le planificateur (cron) : `Authorization: Bearer $CRON_SECRET`. */
async function traiter(req: Request) {
  const secret = process.env.CRON_SECRET;
  const recu = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(recu);
  const b = Buffer.from(secret ?? "");
  if (!secret || secret.length < 24 || a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const bilan = await lancerRelancesAutomatiques();
  // Le ménage ne doit jamais empêcher les relances : un échec ici est sans conséquence pour la réponse.
  const menage = await purgerDonneesPeriodiques().catch(() => null);
  return Response.json({ ok: true, ...bilan, menage }, { headers: { "Cache-Control": "no-store" } });
}

export const GET = traiter;
export const POST = traiter;
