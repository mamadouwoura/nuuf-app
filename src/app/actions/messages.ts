"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { lienPaiement } from "@/lib/encaissement";
import { urlVerification } from "@/lib/quittance";
import { etatAcces } from "@/lib/abonnement";
import { getUser } from "@/lib/session";

const chiffres = (tel: string) => tel.replace(/\D/g, "");
const wa = (tel: string, texte: string) => `https://wa.me/${chiffres(tel)}?text=${encodeURIComponent(texte)}`;

/** Ouvre WhatsApp avec la quittance prête à envoyer, et garde la trace de l'envoi. */
export async function partagerQuittance(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  if (user.membres[0].role === "LECTURE_SEULE") redirect("/quittances");
  if (!etatAcces(user.membres[0].organisation.abonnement).ecriture) redirect("/abonnement/forfait");
  const orgId = user.membres[0].organisationId;
  const q = await db.quittance.findFirst({
    where: { id: String(form.get("id") ?? ""), organisationId: orgId },
    include: { paiement: { include: { echeance: { include: { bail: { include: { locataire: true, bien: true } } } } } } },
  });
  if (!q) redirect("/quittances");
  const loc = q.paiement.echeance.bail.locataire;
  await db.$transaction([
    db.message.create({ data: { organisationId: orgId, canal: "WHATSAPP", type: "QUITTANCE", destinataire: loc.telephone } }),
    db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "quittance.partagee", cible: q.id } }),
  ]);
  revalidatePath("/quittances");
  redirect(
    wa(
      loc.telephone,
      `Bonjour ${loc.nomComplet.split(" ")[0]}, voici votre quittance de loyer ${q.numero} (${fcfa(q.paiement.montant)} FCFA). Vérification : ${urlVerification(q.jetonQr)}`,
    ),
  );
}

/** Relance manuelle d'un loyer en retard : message WhatsApp prêt à envoyer + historique. */
export async function relancer(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  if (user.membres[0].role === "LECTURE_SEULE") redirect("/relances");
  if (!etatAcces(user.membres[0].organisation.abonnement).ecriture) redirect("/abonnement/forfait");
  const orgId = user.membres[0].organisationId;
  const e = await db.echeance.findFirst({
    where: { id: String(form.get("echeanceId") ?? ""), bail: { bien: { organisationId: orgId } } },
    include: { paiements: { where: { statut: "CONFIRME" } }, bail: { include: { locataire: true, bien: true } } },
  });
  if (!e) redirect("/relances");
  const reste = e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0);
  const loc = e.bail.locataire;
  const lien = await lienPaiement(e.id);
  await db.$transaction([
    db.relance.create({ data: { echeanceId: e.id, declencheur: "manuelle" } }),
    db.message.create({ data: { organisationId: orgId, canal: "WHATSAPP", type: "RELANCE", destinataire: loc.telephone } }),
  ]);
  revalidatePath("/relances");
  redirect(
    wa(
      loc.telephone,
      `Bonjour ${loc.nomComplet.split(" ")[0]}, petit rappel : le loyer de ${e.bail.bien.designation} (${fcfa(reste)} FCFA) est arrivé à échéance. Vous pouvez le régler en un clic (Wave ou Orange Money) : ${lien}`,
    ),
  );
}

export async function sauverParametresRelance(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE") redirect("/relances");
  const data = {
    avantEcheance: form.get("avantEcheance") === "on",
    apresJ1: form.get("apresJ1") === "on",
    apresJ5: form.get("apresJ5") === "on",
  };
  await db.parametresRelance.upsert({
    where: { organisationId: membre.organisationId },
    create: { organisationId: membre.organisationId, ...data },
    update: data,
  });
  revalidatePath("/relances");
  redirect("/relances?ok=1");
}
