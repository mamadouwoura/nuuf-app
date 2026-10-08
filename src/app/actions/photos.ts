"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { MAX_OCTETS, MAX_PHOTOS, enregistrerFichier, supprimerFichier, typeImage } from "@/lib/photos";
import { getUser } from "@/lib/session";

async function autorise(bienId: string) {
  const retour = (m: string): never => redirect(`/biens/${bienId}/modifier?erreur=${encodeURIComponent(m)}`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE") retour("Votre rôle ne permet pas de modifier les photos.");
  if (!etatAcces(membre.organisation.abonnement).ecriture) retour("Accès en lecture seule : activez un abonnement.");
  const bien = await db.bien.findFirst({ where: { id: bienId, organisationId: membre.organisationId, archiveLe: null } });
  if (!bien) redirect("/biens");
  return { user, orgId: membre.organisationId, retour };
}

export async function ajouterPhotos(form: FormData) {
  const bienId = String(form.get("id") ?? "");
  const { user, orgId, retour } = await autorise(bienId);
  const fichiers = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!fichiers.length) retour("Choisissez au moins une image.");

  let ajoutees = 0;
  for (const f of fichiers) {
    const nb = await db.photoBien.count({ where: { bienId } });
    if (nb >= MAX_PHOTOS) retour(`Maximum ${MAX_PHOTOS} photos par bien.`);
    if (f.size > MAX_OCTETS) retour(`« ${f.name} » dépasse 5 Mo.`);
    const contenu = new Uint8Array(await f.arrayBuffer());
    const t = typeImage(contenu);
    if (!t) retour(`« ${f.name} » n'est pas une image JPEG, PNG ou WebP.`);
    const nom = await enregistrerFichier(contenu, t!.ext);
    await db.photoBien.create({ data: { bienId, organisationId: orgId, fichier: nom, type: t!.type, taille: contenu.length } });
    ajoutees++;
  }
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.photos_ajoutees", cible: bienId } });
  redirect(`/biens/${bienId}/modifier?ok=${encodeURIComponent(`${ajoutees} photo${ajoutees > 1 ? "s" : ""} ajoutée${ajoutees > 1 ? "s" : ""}.`)}`);
}

export async function supprimerPhoto(form: FormData) {
  const bienId = String(form.get("id") ?? "");
  const { user, orgId } = await autorise(bienId);
  const photo = await db.photoBien.findFirst({ where: { id: String(form.get("photoId") ?? ""), bienId, organisationId: orgId } });
  if (photo) {
    await db.photoBien.delete({ where: { id: photo.id } });
    await supprimerFichier(photo.fichier);
    await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.photo_supprimee", cible: bienId } });
  }
  redirect(`/biens/${bienId}/modifier?ok=${encodeURIComponent("Photo supprimée.")}`);
}
