import { chargerBail, genererContrat } from "@/lib/contrat";
import { refuseSiModule } from "@/lib/permissions";

/** Contrat de location du bail actif, en PDF. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, reponse } = await refuseSiModule("PATRIMOINE");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const bail = await chargerBail(id, user.membres[0].organisationId);
  if (!bail) return new Response("Aucun bail actif pour ce bien.", { status: 404 });
  const pdf = await genererContrat(bail, user.nomComplet);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrat-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
