import { calculerBilan } from "@/lib/bilan";
import { genererBilanPdf } from "@/lib/bilan-pdf";
import { chargerIdentite } from "@/lib/identite";
import { cleMois, debutMois, depuisCle } from "@/lib/loyers";
import { refuseSiModule } from "@/lib/permissions";

/** Compte rendu mensuel du propriétaire, en PDF (réservé à l'organisation). `?mois=AAAA-MM`. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, reponse } = await refuseSiModule("GERANCE");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const orgId = user.membres[0]?.organisationId;
  if (!orgId) return new Response("Non autorisé", { status: 401 });
  const maintenant = new Date();
  const mois = depuisCle(new URL(req.url).searchParams.get("mois") ?? undefined, debutMois(maintenant));
  const bilan = await calculerBilan(orgId, id, mois, maintenant);
  if (!bilan) return new Response("Introuvable", { status: 404 });
  const pdf = await genererBilanPdf(bilan, await chargerIdentite(orgId));
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bilan-${cleMois(mois)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
