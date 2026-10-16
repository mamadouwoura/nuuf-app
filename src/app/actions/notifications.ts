"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/notifications";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const interne = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return /^\/(?!\/)[\w\-/?=&%.]*$/.test(s) ? s : "/notifications"; // chemin interne uniquement, jamais d'URL externe
};

/** Marque une notification comme lue puis ouvre l'écran concerné. */
export async function ouvrirNotification(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const id = String(form.get("id") ?? "");
  await db.notification.updateMany({ where: { id, utilisateurId: user.id, luLe: null }, data: { luLe: new Date() } });
  revalidatePath("/notifications");
  redirect(interne(form.get("lien")));
}

export async function toutLire() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  await db.notification.updateMany({ where: { utilisateurId: user.id, luLe: null }, data: { luLe: new Date() } });
  revalidatePath("/notifications");
  redirect("/notifications");
}

/** Active ou coupe chaque catégorie pour l'utilisateur connecté. */
export async function majPreferences(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  await db.$transaction(
    CATEGORIES.map((c) => {
      const actif = form.get(`cat_${c.code}`) === "on";
      return db.preferenceNotification.upsert({
        where: { utilisateurId_categorie: { utilisateurId: user.id, categorie: c.code } },
        create: { utilisateurId: user.id, categorie: c.code, actif },
        update: { actif },
      });
    }),
  );
  redirect(`/notifications/preferences?ok=${encodeURIComponent(t("Préférences enregistrées."))}`);
}
