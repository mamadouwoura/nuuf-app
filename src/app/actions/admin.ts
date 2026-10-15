"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Forfait } from "@prisma/client";
import { db } from "@/lib/db";
import { exigerAdmin } from "@/lib/admin";
import { getT } from "@/lib/i18n/server";

const JOUR = 86_400_000;
const texte = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const retour = (id: string, m: string, cle: "ok" | "erreur" = "erreur"): never =>
  redirect(`/admin/bailleurs/${id}?${cle}=${encodeURIComponent(m)}`);

async function organisation(form: FormData) {
  const admin = await exigerAdmin();
  const id = texte(form.get("id"));
  const org = await db.organisation.findUnique({ where: { id }, include: { abonnement: true } });
  if (!org) redirect("/admin/bailleurs");
  return { admin, org: org! };
}

/** Prolonge l'essai d'un compte de N jours (à partir de la fin actuelle, ou d'aujourd'hui si elle est passée). */
export async function prolongerEssai(form: FormData) {
  const { t } = await getT();
  const { admin, org } = await organisation(form);
  const jours = Number(texte(form.get("jours")));
  if (![7, 14, 30].includes(jours)) retour(org.id, t("Choisissez une durée."));
  const abo = org.abonnement;
  if (abo?.statut === "ACTIF") retour(org.id, t("Ce compte a un abonnement payant : l'essai ne s'applique pas."));
  const base = abo?.essaiFinLe && abo.essaiFinLe.getTime() > Date.now() ? abo.essaiFinLe.getTime() : Date.now();
  const fin = new Date(base + jours * JOUR);
  await db.abonnement.upsert({
    where: { organisationId: org.id },
    create: { organisationId: org.id, forfait: "DECOUVERTE", statut: "ESSAI", essaiFinLe: fin },
    update: { statut: "ESSAI", essaiFinLe: fin },
  });
  await db.journalAction.create({
    data: { organisationId: org.id, utilisateurId: admin.id, action: "admin.essai_prolonge", cible: `${jours}j` },
  });
  revalidatePath("/admin", "layout");
  retour(org.id, t("Essai prolongé de {n} jours.", { n: jours }), "ok");
}

/** Donne accès à un forfait pendant l'essai (pour que le testeur essaie Pro ou Agence). Jamais sur un compte payant. */
export async function changerForfaitEssai(form: FormData) {
  const { t } = await getT();
  const { admin, org } = await organisation(form);
  const forfait = texte(form.get("forfait"));
  if (!["DECOUVERTE", "PRO", "AGENCE"].includes(forfait)) retour(org.id, t("Choisissez un forfait."));
  const abo = org.abonnement;
  if (abo?.statut === "ACTIF") retour(org.id, t("Ce compte a un abonnement payant : le forfait ne se change pas ici."));
  const fin = abo?.essaiFinLe && abo.essaiFinLe.getTime() > Date.now() ? abo.essaiFinLe : new Date(Date.now() + 14 * JOUR);
  await db.abonnement.upsert({
    where: { organisationId: org.id },
    create: { organisationId: org.id, forfait: forfait as Forfait, statut: "ESSAI", essaiFinLe: fin },
    update: { forfait: forfait as Forfait, statut: "ESSAI", essaiFinLe: fin },
  });
  await db.journalAction.create({
    data: { organisationId: org.id, utilisateurId: admin.id, action: "admin.forfait_essai", cible: forfait },
  });
  revalidatePath("/admin", "layout");
  retour(org.id, t("Forfait d'essai mis à jour."), "ok");
}
