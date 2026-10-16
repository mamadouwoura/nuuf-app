import { db } from "@/lib/db";
import { lireFichier } from "@/lib/photos";
import { refuseSiModule } from "@/lib/permissions";

/** Sert une photo uniquement aux membres de l'organisation propriétaire du bien. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;
  const { user, reponse } = await refuseSiModule("PATRIMOINE");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const photo = await db.photoBien.findFirst({ where: { id: photoId, bienId: id, organisationId: user.membres[0].organisationId } });
  if (!photo) return new Response("Introuvable", { status: 404 });
  const contenu = await lireFichier(photo.fichier);
  if (!contenu) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(contenu), {
    headers: { "Content-Type": photo.type, "Cache-Control": "private, max-age=3600", "Content-Disposition": "inline" },
  });
}
