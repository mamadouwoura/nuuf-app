"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { MAX_OCTETS, MAX_PHOTOS, enregistrerFichier, supprimerFichier, typeImage } from "@/lib/photos";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

async function autorise(bienId: string) {
  const { t } = await getT();
  const retour = (m: string): never => redirect(`/biens/${bienId}/modifier?erreur=${encodeURIComponent(m)}`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE") retour(t("Votre rôle ne permet pas de modifier les photos."));
  if (!etatAcces(membre.organisation.abonnement).ecriture) retour(t("Accès en lecture seule : activez un abonnement."));
  const bien = await db.bien.findFirst({ where: { id: bienId, organisationId: membre.organisationId, archiveLe: null } });
  if (!bien) redirect("/biens");
  return { user, orgId: membre.organisationId, retour };
}

export async function ajouterPhotos(form: FormData) {
  const { t, tn } = await getT();
  const bienId = String(form.get("id") ?? "");
  const { user, orgId, retour } = await autorise(bienId);
  const fichiers = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!fichiers.length) retour(t("Choisissez au moins une image."));

  let ajoutees = 0;
  for (const f of fichiers) {
    const nb = await db.photoBien.count({ where: { bienId } });
    if (nb >= MAX_PHOTOS) retour(t("Maximum {n} photos par bien.", { n: MAX_PHOTOS }));
    if (f.size > MAX_OCTETS) retour(t("« {nom} » dépasse 5 Mo.", { nom: f.name }));
    const contenu = new Uint8Array(await f.arrayBuffer());
    const detecte = typeImage(contenu);
    if (!detecte) retour(t("« {nom} » n'est pas une image JPEG, PNG ou WebP.", { nom: f.name }));
    const nom = await enregistrerFichier(contenu, detecte!.ext);
    await db.photoBien.create({ data: { bienId, organisationId: orgId, fichier: nom, type: detecte!.type, taille: contenu.length } });
    ajoutees++;
  }
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.photos_ajoutees", cible: bienId } });
  redirect(`/biens/${bienId}/modifier?ok=${encodeURIComponent(tn(ajoutees, "{n} photo ajoutée.", "{n} photos ajoutées."))}`);
}

export async function supprimerPhoto(form: FormData) {
  const { t } = await getT();
  const bienId = String(form.get("id") ?? "");
  const { user, orgId } = await autorise(bienId);
  const photo = await db.photoBien.findFirst({ where: { id: String(form.get("photoId") ?? ""), bienId, organisationId: orgId } });
  if (photo) {
    await db.photoBien.delete({ where: { id: photo.id } });
    await supprimerFichier(photo.fichier);
    await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.photo_supprimee", cible: bienId } });
  }
  redirect(`/biens/${bienId}/modifier?ok=${encodeURIComponent(t("Photo supprimée."))}`);
}
