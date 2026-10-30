import { db } from "@/lib/db";
import { chargerQuittance, genererPdf } from "@/lib/quittance";

/** Téléchargement public de la quittance par le locataire (le jeton secret fait office d'autorisation). */
export async function GET(_: Request, { params }: { params: Promise<{ jetonQr: string }> }) {
  const { jetonQr } = await params;
  const ref = await db.quittance.findUnique({ where: { jetonQr }, select: { id: true } });
  if (!ref) return new Response("Introuvable", { status: 404 });
  const q = await chargerQuittance(ref.id);
  if (!q) return new Response("Introuvable", { status: 404 });
  const pdf = await genererPdf(q);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${q.numero}.pdf"`,
      // Document nominatif : ni cache partagé (proxy, CDN) ni copie conservée par le navigateur.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
