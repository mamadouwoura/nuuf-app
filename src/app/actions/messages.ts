"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { lienPaiement } from "@/lib/encaissement";
import { urlVerification } from "@/lib/quittance";
import { etatAcces } from "@/lib/abonnement";
import { getUser } from "@/lib/session";
import { peutAcceder } from "@/lib/permissions";
import { getT } from "@/lib/i18n/server";
import { variablesMessage } from "@/lib/relances-auto";
import { JOURS_MAX, JOURS_MIN, MAX_REGLES, modelePour, remplirModele, reglesValides, validerModele, versJours, type SensRegle } from "@/lib/relances-regles";

const chiffres = (tel: string) => tel.replace(/\D/g, "");
const wa = (tel: string, texte: string) => `https://wa.me/${chiffres(tel)}?text=${encodeURIComponent(texte)}`;

/** Ouvre WhatsApp avec la quittance prête à envoyer, et garde la trace de l'envoi. */
export async function partagerQuittance(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  if (user.membres[0].role === "LECTURE_SEULE" || !peutAcceder(user.membres[0], "LOYERS")) redirect("/quittances");
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

/** Autorise l'action : connecté, rôle qui peut modifier les loyers, abonnement actif. Sinon redirige. */
async function membreRelances() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE" || !peutAcceder(membre, "LOYERS")) redirect("/relances");
  if (!etatAcces(membre.organisation.abonnement).ecriture) redirect("/abonnement/forfait");
  return { user, membre, orgId: membre.organisationId };
}

const JOUR = 86_400_000;

/** Relance manuelle d'un loyer en retard : message WhatsApp prêt à envoyer (texte personnalisable) + historique. */
export async function relancer(form: FormData) {
  const { orgId } = await membreRelances();
  const e = await db.echeance.findFirst({
    where: { id: String(form.get("echeanceId") ?? ""), bail: { bien: { organisationId: orgId } } },
    include: { paiements: { where: { statut: "CONFIRME" } }, bail: { include: { locataire: true, bien: true } } },
  });
  if (!e) redirect("/relances");
  const reste = e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0);
  const loc = e.bail.locataire;
  const lien = await lienPaiement(e.id);
  const parametres = await db.parametresRelance.findUnique({ where: { organisationId: orgId } });
  const maintenant = new Date();
  const jours = Math.max(1, Math.round((Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()) - e.dateLimite.getTime()) / JOUR));
  const modele = parametres?.modeleRetard ?? null;
  const texte = modele
    ? remplirModele(modelePour(jours, { modeleRetard: modele }), variablesMessage(e, reste, lien, jours))
    : `Bonjour ${loc.nomComplet.split(" ")[0]}, petit rappel : le loyer de ${e.bail.bien.designation} (${fcfa(reste)} FCFA) est arrivé à échéance. Vous pouvez le régler en un clic (Wave ou Orange Money) : ${lien}`;
  await db.$transaction([
    db.relance.create({ data: { echeanceId: e.id, declencheur: "manuelle" } }),
    db.message.create({ data: { organisationId: orgId, canal: "WHATSAPP", type: "RELANCE", destinataire: loc.telephone } }),
  ]);
  revalidatePath("/relances");
  redirect(wa(loc.telephone, texte));
}

const lireEntier = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").trim());
  return Number.isInteger(n) ? n : NaN;
};

/**
 * Enregistre les réglages de relance : règles (décalages en jours, actives ou non), heure d'envoi et textes personnalisés.
 * Les champs « regle » listent toutes les règles affichées, « on » celles qui sont actives, « suppr » celles à retirer.
 */
export async function sauverParametresRelance(form: FormData) {
  const { t } = await getT();
  const { user, orgId } = await membreRelances();
  const echec = (m: string) => redirect(`/relances?erreur=${encodeURIComponent(m)}`);

  const presentes = form.getAll("regle").map((v) => lireEntier(v));
  const actives = new Set(form.getAll("on").map((v) => lireEntier(v)));
  const retirees = new Set(form.getAll("suppr").map((v) => lireEntier(v)));
  const toutes = presentes.filter((j) => !retirees.has(j));

  // Règle ajoutée dans le formulaire (facultative)
  const sens = String(form.get("nouveauSens") ?? "") as SensRegle;
  const nombreBrut = String(form.get("nouveauNombre") ?? "").trim();
  if (nombreBrut !== "" || sens === "jour") {
    if (!["avant", "jour", "apres"].includes(sens)) echec(t("Choisissez quand envoyer la nouvelle relance."));
    const nombre = sens === "jour" ? 0 : lireEntier(nombreBrut);
    if (!Number.isInteger(nombre) || nombre < 0) echec(t("Indiquez un nombre de jours entier."));
    const jours = versJours(sens, nombre);
    if (jours < JOURS_MIN || jours > JOURS_MAX) echec(t("Le décalage doit être compris entre {min} jours avant et {max} jours après l'échéance.", { min: -JOURS_MIN, max: JOURS_MAX }));
    if (!toutes.includes(jours)) toutes.push(jours);
    actives.add(jours);
  }
  if (toutes.some((j) => !Number.isInteger(j))) echec(t("Réglage invalide."));
  const regles = reglesValides(toutes);
  if (regles.length !== new Set(toutes).size) echec(t("Vous ne pouvez pas avoir plus de {n} règles de relance, entre {min} jours avant et {max} jours après l'échéance.", { n: MAX_REGLES, min: -JOURS_MIN, max: JOURS_MAX }));

  const heure = lireEntier(form.get("heureEnvoi"));
  if (!Number.isInteger(heure) || heure < 0 || heure > 23) echec(t("Choisissez une heure d'envoi entre 0 h et 23 h."));

  const avant = validerModele(String(form.get("modeleAvant") ?? ""));
  if (!avant.ok) echec(t(avant.erreur));
  const retard = validerModele(String(form.get("modeleRetard") ?? ""));
  if (!retard.ok) echec(t(retard.erreur));

  await db.$transaction(async (tx) => {
    await tx.parametresRelance.upsert({
      where: { organisationId: orgId },
      create: { organisationId: orgId, heureEnvoi: heure, modeleAvant: avant.ok ? avant.texte : null, modeleRetard: retard.ok ? retard.texte : null },
      update: { heureEnvoi: heure, modeleAvant: avant.ok ? avant.texte : null, modeleRetard: retard.ok ? retard.texte : null },
    });
    await tx.regleRelance.deleteMany({ where: { organisationId: orgId } });
    if (regles.length) await tx.regleRelance.createMany({ data: regles.map((jours) => ({ organisationId: orgId, jours, actif: actives.has(jours) })) });
    await tx.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "relances.reglages", cible: orgId } });
  });
  revalidatePath("/relances");
  redirect("/relances?ok=1");
}

/** Programme l'envoi d'une relance pour un loyer précis, à une date et une heure précises (heure de Dakar, GMT). */
export async function programmerRelance(form: FormData) {
  const { t } = await getT();
  const { user, orgId } = await membreRelances();
  const echec = (m: string) => redirect(`/relances?erreur=${encodeURIComponent(m)}`);
  const e = await db.echeance.findFirst({
    where: { id: String(form.get("echeanceId") ?? ""), bail: { actif: true, bien: { organisationId: orgId } } },
    include: { paiements: { where: { statut: "CONFIRME" } } },
  });
  if (!e) redirect("/relances");
  if (e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0) <= 0) echec(t("Ce loyer est déjà réglé."));

  const date = String(form.get("date") ?? "");
  const heure = String(form.get("heure") ?? "");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const h = /^(\d{2}):(\d{2})$/.exec(heure);
  if (!m || !h) echec(t("Indiquez la date et l'heure d'envoi."));
  const envoiLe = new Date(Date.UTC(Number(m![1]), Number(m![2]) - 1, Number(m![3]), Number(h![1]), Number(h![2])));
  if (Number.isNaN(envoiLe.getTime()) || envoiLe.getUTCMonth() !== Number(m![2]) - 1 || Number(h![1]) > 23 || Number(h![2]) > 59) echec(t("Date ou heure invalide."));
  const maintenant = Date.now();
  if (envoiLe.getTime() < maintenant + 60_000) echec(t("L'envoi programmé doit être dans le futur."));
  if (envoiLe.getTime() > maintenant + 90 * JOUR) echec(t("L'envoi programmé ne peut pas dépasser 90 jours."));
  const dejaProgrammees = await db.relanceProgrammee.count({ where: { organisationId: orgId, envoyeeLe: null, annuleeLe: null } });
  if (dejaProgrammees >= 200) echec(t("Trop de relances programmées en attente."));

  await db.$transaction([
    db.relanceProgrammee.create({ data: { organisationId: orgId, echeanceId: e.id, envoiLe } }),
    db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "relance.programmee", cible: e.id } }),
  ]);
  revalidatePath("/relances");
  redirect("/relances?ok=programmee");
}

/** Annule une relance programmée qui n'est pas encore partie. */
export async function annulerRelanceProgrammee(form: FormData) {
  const { orgId } = await membreRelances();
  await db.relanceProgrammee.updateMany({
    where: { id: String(form.get("id") ?? ""), organisationId: orgId, envoyeeLe: null, annuleeLe: null },
    data: { annuleeLe: new Date() },
  });
  revalidatePath("/relances");
  redirect("/relances?ok=annulee");
}

