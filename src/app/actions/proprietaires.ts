"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { calculerBilan, prochainNumeroMandat } from "@/lib/bilan";
import { signatureValide } from "@/lib/fiche";
import { fcfa } from "@/lib/immo";
import { depuisCle } from "@/lib/loyers";
import { normalizePhone } from "@/lib/security";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { notifierSansEchec } from "@/lib/notifications";
import { N_ } from "@/lib/i18n/translate";
import { peutAcceder } from "@/lib/permissions";

const texte = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const entier = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\D/g, "")) || 0;
const KEY_MOIS = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Utilisateur autorisé à modifier les propriétaires et leurs mandats de l'organisation. */
async function autorise(retour: string) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const vers = (m: string): never => redirect(`${retour}${retour.includes("?") ? "&" : "?"}erreur=${encodeURIComponent(m)}`);
  if (!membre || membre.role === "LECTURE_SEULE") vers(t("Votre rôle ne permet pas de modifier les propriétaires."));
  if (!peutAcceder(membre, "GERANCE")) vers(t("Votre accès ne comprend pas ce module."));
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour modifier vos propriétaires."))}`);
  }
  return { user, orgId: membre.organisationId, vers, t };
}

async function proprietaireDe(orgId: string, id: string) {
  const p = await db.proprietaire.findFirst({ where: { id, organisationId: orgId } });
  if (!p) redirect("/proprietaires");
  return p;
}

function lirePersonne(form: FormData, t: (c: string) => string, vers: (m: string) => never) {
  const nomComplet = texte(form.get("nomComplet"));
  if (nomComplet.length < 3) vers(t("Indiquez le nom du propriétaire."));
  const telBrut = texte(form.get("telephone"), 30);
  const telephone = telBrut ? normalizePhone(telBrut) : null;
  if (telBrut && !telephone) vers(t("Numéro invalide. Exemple : 77 123 45 67"));
  const email = texte(form.get("email"), 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) vers(t("Adresse e-mail invalide."));
  const typePiece = ["CNI", "PASSEPORT", "RCCM", "AUTRE"].find((x) => x === form.get("typePiece")) ?? null;
  const brutPiece = texte(form.get("pieceEtablieLe"), 10);
  const pieceEtablieLe = brutPiece ? new Date(`${brutPiece}T00:00:00.000Z`) : null;
  if (pieceEtablieLe && Number.isNaN(pieceEtablieLe.getTime())) vers(t("Date de la pièce invalide."));
  return {
    nomComplet,
    telephone,
    cni: texte(form.get("cni"), 40) || null,
    adresse: texte(form.get("adresse"), 200) || null,
    email: email || null,
    ville: texte(form.get("ville"), 80) || null,
    personneMorale: form.get("personneMorale") === "on",
    typePiece,
    pieceEtablieLe,
    bp: texte(form.get("bp"), 40) || null,
    compteContribuable: texte(form.get("compteContribuable"), 40) || null,
  };
}

export async function creerProprietaire(form: FormData) {
  const { user, orgId, vers, t } = await autorise("/proprietaires");
  const donnees = lirePersonne(form, t, vers);
  const p = await db.proprietaire.create({ data: { organisationId: orgId, ...donnees } });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "proprietaire.cree", cible: p.id } });
  await notifierSansEchec({ organisationId: orgId, categorie: "PROPRIETAIRES", titre: N_("Nouveau propriétaire"), texte: N_("{nom} a été ajouté."), donnees: { nom: p.nomComplet }, lien: `/proprietaires/${p.id}`, sauf: user.id });
  redirect(`/proprietaires/${p.id}`);
}

export async function majProprietaire(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, vers, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  await db.proprietaire.update({ where: { id: p.id }, data: lirePersonne(form, t, vers) });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "proprietaire.modifie", cible: p.id } });
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Propriétaire enregistré."))}`);
}

export async function rattacherBiens(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const ids = form.getAll("biens").map(String).slice(0, 200);
  const r = await db.bien.updateMany({ where: { id: { in: ids }, organisationId: orgId, archiveLe: null, proprietaireId: null }, data: { proprietaireId: p.id } });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "proprietaire.biens_rattaches", cible: p.id } });
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("{n} bien(s) rattaché(s).", { n: r.count }))}`);
}

export async function detacherBien(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { orgId } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  await db.bien.updateMany({ where: { id: texte(form.get("bienId"), 40), organisationId: orgId, proprietaireId: p.id }, data: { proprietaireId: null, mandatId: null } });
  redirect(`/proprietaires/${p.id}`);
}

/** « 7,5 » ou « 7.5 » → 7.5, entre 0 et 50. */
function lirePourcentage(v: FormDataEntryValue | null) {
  const n = Number(String(v ?? "").replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n >= 0 && n <= 50 ? Math.round(n * 10) / 10 : null;
}

export async function enregistrerMandat(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, vers, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const commissionPct = lirePourcentage(form.get("commissionPct"));
  if (commissionPct === null) vers(t("Indiquez une commission entre 0 et 50 %."));
  const debut = new Date(`${texte(form.get("debutLe"), 10)}T00:00:00.000Z`);
  if (Number.isNaN(debut.getTime())) vers(t("Indiquez la date de début du mandat."));
  const dureeMois = Math.min(Math.max(entier(form.get("dureeMois")) || 12, 1), 120);
  const jourReversement = Math.min(Math.max(entier(form.get("jourReversement")) || 10, 1), 28);
  const preavisMois = Math.min(Math.max(entier(form.get("preavisMois")) || 1, 0), 12);
  const plafond = entier(form.get("plafondTravaux"));
  const agentNom = texte(form.get("agentNom"), 80) || null;
  const commissionAgentPct = agentNom ? lirePourcentage(form.get("commissionAgentPct")) : 0;
  if (commissionAgentPct === null) vers(t("Indiquez la commission de l'agent entre 0 et 50 %."));
  if (commissionAgentPct! > commissionPct!) vers(t("La commission de l'agent est prélevée sur celle de l'agence : elle ne peut pas la dépasser."));
  const sigA = texte(form.get("signatureAgence"), 260_000);
  const sigP = texte(form.get("signatureProprietaire"), 260_000);
  if ((sigA && !signatureValide(sigA)) || (sigP && !signatureValide(sigP))) vers(t("La signature n'a pas pu être enregistrée. Signez à nouveau."));

  // Avec un mandatId on met à jour ce portefeuille ; sans, on en crée un nouveau (un propriétaire peut en avoir plusieurs).
  const mandatId = texte(form.get("mandatId"), 40);
  const existant = mandatId ? await db.mandat.findFirst({ where: { id: mandatId, organisationId: orgId, proprietaireId: p.id, actif: true } }) : null;
  if (mandatId && !existant) vers(t("Mandat introuvable."));
  const donnees = {
    libelle: texte(form.get("libelle"), 80) || null,
    commissionPct: commissionPct!,
    debutLe: debut,
    dureeMois,
    reconduction: form.get("reconduction") === "on",
    jourReversement,
    plafondTravaux: plafond > 0 ? plafond : null,
    preavisMois,
    agentNom,
    commissionAgentPct: commissionAgentPct!,
    ...(sigA ? { signatureAgence: sigA } : {}),
    ...(sigP ? { signatureProprietaire: sigP } : {}),
    ...(sigA || sigP ? { signeLe: new Date() } : {}),
  };
  if (existant) {
    await db.mandat.update({ where: { id: existant.id }, data: donnees });
  } else {
    await db.mandat.create({ data: { organisationId: orgId, proprietaireId: p.id, numero: await prochainNumeroMandat(orgId), ...donnees } });
  }
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "mandat.enregistre", cible: p.id } });
  await notifierSansEchec({ organisationId: orgId, categorie: "PROPRIETAIRES", titre: N_("Mandat enregistré"), texte: N_("Mandat de {nom} mis à jour."), donnees: { nom: p.nomComplet }, lien: `/proprietaires/${p.id}`, sauf: user.id });
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Mandat enregistré."))}`);
}

export async function ajouterRetenue(form: FormData) {
  const id = texte(form.get("id"), 40);
  const cle = texte(form.get("mois"), 7);
  const retour = `/proprietaires/${id}/bilan?mois=${cle}`;
  const { user, orgId, vers, t } = await autorise(retour);
  const p = await proprietaireDe(orgId, id);
  if (!KEY_MOIS.test(cle)) redirect(`/proprietaires/${id}/bilan`);
  const libelle = texte(form.get("libelle"), 80);
  const montant = entier(form.get("montant"));
  if (libelle.length < 2) vers(t("Indiquez le motif de la retenue."));
  if (montant <= 0) vers(t("Indiquez le montant de la retenue."));
  await db.retenueBilan.create({ data: { organisationId: orgId, proprietaireId: p.id, mois: depuisCle(cle, new Date()), libelle, montant } });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bilan.retenue_ajoutee", cible: p.id } });
  redirect(retour);
}

export async function supprimerRetenue(form: FormData) {
  const id = texte(form.get("id"), 40);
  const cle = texte(form.get("mois"), 7);
  const { orgId } = await autorise(`/proprietaires/${id}/bilan?mois=${cle}`);
  const p = await proprietaireDe(orgId, id);
  await db.retenueBilan.deleteMany({ where: { id: texte(form.get("retenueId"), 40), organisationId: orgId, proprietaireId: p.id } });
  redirect(`/proprietaires/${id}/bilan?mois=${cle}`);
}

/** Marque le mois comme reversé : suivi manuel, Nuuf ne déplace aucun fonds. */
export async function marquerReverse(form: FormData) {
  const id = texte(form.get("id"), 40);
  const cle = texte(form.get("mois"), 7);
  const retour = `/proprietaires/${id}/bilan?mois=${cle}`;
  const { user, orgId, vers, t } = await autorise(retour);
  const p = await proprietaireDe(orgId, id);
  if (!KEY_MOIS.test(cle)) redirect(`/proprietaires/${id}/bilan`);
  const mois = depuisCle(cle, new Date());
  const bilan = await calculerBilan(orgId, p.id, mois);
  if (!bilan) redirect("/proprietaires");
  if (bilan!.net <= 0) vers(t("Il n'y a rien à reverser pour ce mois."));
  const reference = texte(form.get("reference"), 60) || null;
  await db.$transaction([
    db.reversement.upsert({
      where: { proprietaireId_mois: { proprietaireId: p.id, mois } },
      create: { organisationId: orgId, proprietaireId: p.id, mois, montant: bilan!.net, reverseLe: new Date(), reference },
      update: { montant: bilan!.net, reverseLe: new Date(), reference },
    }),
    // Les remboursements d'avances de ce bilan deviennent définitifs : les mois suivants repartent du reste réel.
    ...bilan!.avances
      .filter((a) => a.prelevement > 0)
      .map((a) =>
        db.remboursementAvance.upsert({
          where: { avanceId_mois: { avanceId: a.id, mois } },
          create: { avanceId: a.id, organisationId: orgId, montant: a.prelevement, mois },
          update: { montant: a.prelevement },
        }),
      ),
  ]);
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bilan.reverse", cible: p.id } });
  await notifierSansEchec({ organisationId: orgId, categorie: "PROPRIETAIRES", titre: N_("Reversement enregistré"), texte: N_("{nom} : {montant} FCFA reversés pour {mois}."), donnees: { nom: p.nomComplet, montant: fcfa(bilan!.net), mois: cle }, lien: retour, sauf: user.id });
  redirect(`${retour}&ok=1`);
}

export async function annulerReversement(form: FormData) {
  const id = texte(form.get("id"), 40);
  const cle = texte(form.get("mois"), 7);
  const { orgId } = await autorise(`/proprietaires/${id}/bilan?mois=${cle}`);
  const p = await proprietaireDe(orgId, id);
  if (KEY_MOIS.test(cle)) {
    const mois = depuisCle(cle, new Date());
    await db.$transaction([
      db.reversement.deleteMany({ where: { organisationId: orgId, proprietaireId: p.id, mois } }),
      db.remboursementAvance.deleteMany({ where: { organisationId: orgId, mois, avance: { proprietaireId: p.id } } }),
    ]);
  }
  redirect(`/proprietaires/${id}/bilan?mois=${cle}`);
}

/** Met fin à un mandat : ses biens retombent sur le mandat principal du propriétaire. */
export async function terminerMandat(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const mandatId = texte(form.get("mandatId"), 40);
  const m = await db.mandat.findFirst({ where: { id: mandatId, organisationId: orgId, proprietaireId: p.id, actif: true } });
  if (!m) redirect(`/proprietaires/${p.id}`);
  await db.$transaction([
    db.bien.updateMany({ where: { mandatId: m!.id, organisationId: orgId }, data: { mandatId: null } }),
    db.mandat.update({ where: { id: m!.id }, data: { actif: false } }),
    db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "mandat.termine", cible: m!.id } }),
  ]);
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Mandat terminé : ses biens suivent maintenant le mandat principal."))}`);
}

/** Affecte à un portefeuille (mandat non principal) la liste des biens cochés ; les décochés retombent sur le mandat principal. */
export async function affecterBiens(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const mandats = await db.mandat.findMany({ where: { organisationId: orgId, proprietaireId: p.id, actif: true }, orderBy: { creeLe: "asc" }, select: { id: true } });
  const mandatId = texte(form.get("mandatId"), 40);
  // Le mandat principal couvre « le reste » : on n'y affecte pas de bien explicitement.
  if (!mandats.some((m, i) => i > 0 && m.id === mandatId)) redirect(`/proprietaires/${p.id}`);
  const coches = form.getAll("biens").map(String).slice(0, 300);
  await db.$transaction([
    db.bien.updateMany({ where: { organisationId: orgId, proprietaireId: p.id, mandatId, id: { notIn: coches } }, data: { mandatId: null } }),
    db.bien.updateMany({ where: { organisationId: orgId, proprietaireId: p.id, archiveLe: null, id: { in: coches } }, data: { mandatId } }),
    db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "mandat.biens", cible: mandatId } }),
  ]);
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Biens du portefeuille enregistrés."))}`);
}

/** Ouvre WhatsApp avec le résumé du bilan prêt à envoyer au propriétaire. */
export async function partagerBilan(form: FormData) {
  const id = texte(form.get("id"), 40);
  const cle = texte(form.get("mois"), 7);
  const retour = `/proprietaires/${id}/bilan?mois=${cle}`;
  const { user, orgId, vers, t } = await autorise(retour);
  const p = await proprietaireDe(orgId, id);
  if (!KEY_MOIS.test(cle)) redirect(`/proprietaires/${id}/bilan`);
  if (!p.telephone) return vers(t("Ajoutez le numéro du propriétaire pour lui envoyer son bilan."));
  const b = await calculerBilan(orgId, p.id, depuisCle(cle, new Date()));
  if (!b) redirect("/proprietaires");
  const org = await db.organisation.findUnique({ where: { id: orgId }, select: { nom: true } });
  const prenom = p.nomComplet.split(" ")[0];
  const mois = new Date(Date.UTC(Number(cle.slice(0, 4)), Number(cle.slice(5)) - 1, 1)).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  const message =
    `Bonjour ${prenom}, voici votre compte rendu de gestion de ${mois} (${org?.nom ?? "votre agence"}) : ` +
    `loyers encaissés ${fcfa(b!.encaisse)} FCFA, commission ${fcfa(b!.commission)} FCFA` +
    (b!.totalRetenues ? `, retenues ${fcfa(b!.totalRetenues)} FCFA` : "") +
    (b!.totalAvances ? `, remboursement d'avance ${fcfa(b!.totalAvances)} FCFA` : "") +
    `, net à vous reverser ${fcfa(b!.net)} FCFA.` +
    (b!.impayes > 0 ? ` Loyers restant dus : ${fcfa(b!.impayes)} FCFA.` : "");
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bilan.partage", cible: p.id } });
  redirect(`https://wa.me/${p.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`);
}

/** Avance (acompte) consentie au propriétaire ; remboursée automatiquement sur ses bilans. */
export async function creerAvance(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, vers, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const montant = entier(form.get("montant"));
  if (montant <= 0) vers(t("Indiquez le montant de l'avance."));
  const date = new Date(`${texte(form.get("accordeLe"), 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) vers(t("Indiquez la date de l'avance."));
  const mensualite = entier(form.get("mensualite"));
  await db.avanceProprietaire.create({
    data: { organisationId: orgId, proprietaireId: p.id, montant, accordeLe: date, motif: texte(form.get("motif"), 120) || null, mensualite: mensualite > 0 ? mensualite : null },
  });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "avance.creee", cible: p.id } });
  await notifierSansEchec({ organisationId: orgId, categorie: "ACOMPTES", titre: N_("Nouvelle avance"), texte: N_("{nom} : {montant} FCFA."), donnees: { nom: p.nomComplet, montant: fcfa(montant) }, lien: `/proprietaires/${p.id}`, sauf: user.id });
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Avance enregistrée."))}`);
}

export async function supprimerAvance(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { orgId, vers, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const avanceId = texte(form.get("avanceId"), 40);
  const deja = await db.remboursementAvance.count({ where: { avanceId, organisationId: orgId, avance: { proprietaireId: p.id } } });
  if (deja > 0) vers(t("Cette avance a déjà été remboursée en partie : elle ne peut plus être supprimée."));
  await db.avanceProprietaire.deleteMany({ where: { id: avanceId, organisationId: orgId, proprietaireId: p.id } });
  redirect(`/proprietaires/${p.id}`);
}

/** Remboursement versé à part par le propriétaire (espèces, virement), hors bilan. */
export async function rembourserAvance(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, orgId, vers, t } = await autorise(`/proprietaires/${id}`);
  const p = await proprietaireDe(orgId, id);
  const avance = await db.avanceProprietaire.findFirst({ where: { id: texte(form.get("avanceId"), 40), organisationId: orgId, proprietaireId: p.id }, include: { remboursements: true } });
  if (!avance) redirect(`/proprietaires/${p.id}`);
  const reste = avance!.montant - avance!.remboursements.reduce((s, r) => s + r.montant, 0);
  const montant = entier(form.get("montant"));
  if (montant <= 0 || montant > reste) vers(t("Le montant doit être compris entre 1 FCFA et le reste dû ({reste} FCFA).", { reste: fcfa(reste) }));
  await db.remboursementAvance.create({ data: { avanceId: avance!.id, organisationId: orgId, montant, note: texte(form.get("note"), 80) || null } });
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "avance.remboursee", cible: p.id } });
  await notifierSansEchec({ organisationId: orgId, categorie: "ACOMPTES", titre: N_("Remboursement d'avance"), texte: N_("{nom} a remboursé {montant} FCFA."), donnees: { nom: p.nomComplet, montant: fcfa(montant) }, lien: `/proprietaires/${p.id}`, sauf: user.id });
  redirect(`/proprietaires/${p.id}?ok=${encodeURIComponent(t("Remboursement enregistré."))}`);
}
