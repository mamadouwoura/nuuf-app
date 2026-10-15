import { db } from "@/lib/db";
import { getUser } from "@/lib/session";

/** Logo de l'organisation connectée (aperçu dans les paramètres). */
export async function GET() {
  const user = await getUser();
  const orgId = user?.membres[0]?.organisationId;
  if (!orgId) return new Response("Non autorisé", { status: 401 });
  const logo = await db.logoOrganisation.findUnique({ where: { organisationId: orgId } });
  if (!logo) return new Response("Introuvable", { status: 404 });
  return new Response(Buffer.from(logo.octets), {
    headers: {
      "Content-Type": logo.type === "png" ? "image/png" : "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
