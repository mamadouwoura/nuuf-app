import { db } from "@/lib/db";
import { chargerIdentite } from "@/lib/identite";
import { genererMandat } from "@/lib/mandat-pdf";
import { getUser } from "@/lib/session";

/** Mandat de gestion actif du propriétaire, en PDF (réservé à l'organisation qui l'a établi). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const orgId = user.membres[0]?.organisationId;
  if (!orgId) return new Response("Non autorisé", { status: 401 });
  const proprietaire = await db.proprietaire.findFirst({
    where: { id, organisationId: orgId },
    include: {
      mandats: { where: { actif: true }, orderBy: { creeLe: "desc" }, take: 1 },
      biens: { where: { archiveLe: null }, orderBy: { designation: "asc" }, select: { designation: true, quartier: true, ville: true } },
      organisation: { select: { nom: true, ninea: true } },
    },
  });
  const mandat = proprietaire?.mandats[0];
  if (!proprietaire || !mandat) return new Response("Aucun mandat pour ce propriétaire.", { status: 404 });
  const pdf = await genererMandat(mandat, {
    agence: { nom: proprietaire.organisation.nom, ninea: proprietaire.organisation.ninea, representant: user.nomComplet },
    identite: await chargerIdentite(orgId),
    proprietaire,
    biens: proprietaire.biens,
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${mandat.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
