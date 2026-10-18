"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { analyserAvenant } from "@/lib/avenants";
import { enregistrerAvenant } from "@/lib/avenants-db";
import { peutAcceder } from "@/lib/permissions";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const texte = (v: FormDataEntryValue | null, max = 100) => String(v ?? "").trim().slice(0, max);

/** Enregistre un avenant au bail actif d'un bien et applique ses effets (loyer des échéances à venir, durée du bail). */
export async function creerAvenant(form: FormData) {
  const { t } = await getT();
  const bienId = texte(form.get("bienId"), 40);
  const retour = (e: string) => redirect(`/biens/${bienId}?erreur=${encodeURIComponent(e)}#avenants`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE" || !peutAcceder(membre, "PATRIMOINE")) redirect(`/biens/${bienId}`);
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour modifier vos données."))}`);
  }
  const orgId = membre.organisationId;
  const bail = await db.bail.findFirst({
    where: { bienId, actif: true, bien: { organisationId: orgId, archiveLe: null } },
    select: { id: true, loyerMensuel: true, debutLe: true, finLe: true },
  });
  if (!bail) retour(t("Aucun bail actif pour ce bien."));

  const now = new Date();
  const analyse = analyserAvenant(
    {
      type: texte(form.get("type"), 10),
      effet: texte(form.get("effet"), 10),
      loyer: Number(texte(form.get("loyer"), 14).replace(/\D/g, "")),
      finLe: texte(form.get("finLe"), 10),
      clause: texte(form.get("clause"), 1200),
    },
    bail!,
    now,
  );
  if (!analyse.ok) retour(t(analyse.erreur));
  const a = (analyse as Extract<typeof analyse, { ok: true }>).avenant;

  const numero = await enregistrerAvenant({ bailId: bail!.id, organisationId: orgId, utilisateurId: user.id, avenant: a, now });
  if (numero === null) retour(t("Un autre avenant vient d'être enregistré pour ce bail. Réessayez."));
  redirect(`/biens/${bienId}?ok=avenant#avenants`);
}
