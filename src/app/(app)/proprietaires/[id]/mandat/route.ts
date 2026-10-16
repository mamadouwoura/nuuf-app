import { db } from "@/lib/db";
import { chargerIdentite } from "@/lib/identite";
import { genererMandat } from "@/lib/mandat-pdf";
import { refuseSiModule } from "@/lib/permissions";

/** Mandat de gestion actif du propriétaire, en PDF (réservé à l'organisation qui l'a établi). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, reponse } = await refuseSiModule("GERANCE");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const orgId = user.membres[0]?.organisationId;
  if (!orgId) return new Response("Non autorisé", { status: 401 });
  const proprietaire = await db.proprietaire.findFirst({
    where: { id, organisationId: orgId },
    include: {
      mandats: { where: { actif: true }, orderBy: { creeLe: "asc" } },
      biens: { where: { archiveLe: null }, orderBy: { designation: "asc" }, select: { designation: true, quartier: true, ville: true, mandatId: true } },
      organisation: { select: { nom: true, ninea: true } },
    },
  });
  // Mandat demandé (?m=), sinon le principal. Le principal couvre aussi les biens sans portefeuille précis.
  const demande = new URL(req.url).searchParams.get("m");
  const mandat = proprietaire?.mandats.find((m) => m.id === demande) ?? proprietaire?.mandats[0];
  const principal = mandat && proprietaire?.mandats[0]?.id === mandat.id;
  const couverts = (proprietaire?.biens ?? []).filter((b) => b.mandatId === mandat?.id || (principal && !b.mandatId));
  if (!proprietaire || !mandat) return new Response("Aucun mandat pour ce propriétaire.", { status: 404 });
  const pdf = await genererMandat(mandat, {
    agence: { nom: proprietaire.organisation.nom, ninea: proprietaire.organisation.ninea, representant: user.nomComplet },
    identite: await chargerIdentite(orgId),
    proprietaire,
    biens: couverts,
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${mandat.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
