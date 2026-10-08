import { chargerQuittance, genererPdf } from "@/lib/quittance";
import { getUser } from "@/lib/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const q = await chargerQuittance(id, user.membres[0].organisationId);
  if (!q) return new Response("Introuvable", { status: 404 });
  const pdf = await genererPdf(q);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${q.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
