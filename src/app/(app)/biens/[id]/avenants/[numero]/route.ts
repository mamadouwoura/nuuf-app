import { db } from "@/lib/db";
import { chargerBail } from "@/lib/contrat";
import { genererAvenant } from "@/lib/avenant-pdf";
import { refuseSiModule } from "@/lib/permissions";

/** Avenant n° X du bail actif d'un bien, en PDF. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; numero: string }> }) {
  const { id, numero } = await params;
  const { user, reponse } = await refuseSiModule("PATRIMOINE");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const n = Number(numero);
  if (!Number.isInteger(n) || n < 1) return new Response("Avenant introuvable.", { status: 404 });
  const bail = await chargerBail(id, user.membres[0].organisationId);
  if (!bail) return new Response("Aucun bail actif pour ce bien.", { status: 404 });
  const avenant = await db.avenant.findUnique({ where: { bailId_numero: { bailId: bail.id, numero: n } } });
  if (!avenant) return new Response("Avenant introuvable.", { status: 404 });
  const pdf = await genererAvenant(bail, avenant, user.nomComplet);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="avenant-${n}-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
