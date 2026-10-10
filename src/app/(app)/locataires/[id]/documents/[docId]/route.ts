import { db } from "@/lib/db";
import { lireDocument } from "@/lib/documents";
import { getUser } from "@/lib/session";

/** Sert un document de locataire uniquement aux membres de l'organisation propriétaire. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const user = await getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const doc = await db.documentLocataire.findFirst({ where: { id: docId, locataireId: id, organisationId: user.membres[0].organisationId } });
  if (!doc) return new Response("Introuvable", { status: 404 });
  const contenu = await lireDocument(doc.fichier);
  if (!contenu) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(contenu), {
    headers: {
      "Content-Type": doc.type,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'",
    },
  });
}
