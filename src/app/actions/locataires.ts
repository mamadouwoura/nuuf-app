"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MAX_DOCUMENTS, MAX_OCTETS_DOCUMENT, enregistrerDocument, supprimerDocumentFichier, typeDocument } from "@/lib/documents";
import { etatAcces } from "@/lib/abonnement";
import { justificatifsValides, normaliserCni, signatureValide, situationValide, statutProValide } from "@/lib/fiche";
import { normalizePhone } from "@/lib/security";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { notifierSansEchec } from "@/lib/notifications";
import { N_ } from "@/lib/i18n/translate";
import { peutAcceder } from "@/lib/permissions";

const texte = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const entier = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/\D/g, ""));
  return String(v ?? "").trim() === "" || !Number.isFinite(n) ? null : Math.min(n, 30);
};

/** Enregistre la fiche de renseignement saisie par l'agent en face du locataire. */
export async function enregistrerFiche(form: FormData) {
  const { t } = await getT();
  const id = texte(form.get("id"), 40);
  const retour = (e: string) => redirect(`/locataires/${id}/fiche?erreur=${encodeURIComponent(e)}`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE" || !peutAcceder(membre, "PATRIMOINE")) redirect(`/locataires/${id}`);
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour modifier vos données."))}`);
  }
  const loc = await db.locataire.findFirst({ where: { id, organisationId: membre.organisationId } });
  if (!loc) redirect("/locataires");

  const nomComplet = texte(form.get("nomComplet"));
  if (nomComplet.length < 3) retour(t("Indiquez le prénom et le nom du locataire."));

  const naiss = texte(form.get("dateNaissance"), 10);
  let dateNaissance: Date | null = null;
  if (naiss) {
    dateNaissance = new Date(`${naiss}T00:00:00.000Z`);
    const an = dateNaissance.getUTCFullYear();
    if (Number.isNaN(dateNaissance.getTime()) || an < 1900 || dateNaissance.getTime() > Date.now()) retour(t("Date de naissance invalide."));
  }

  const telUrgenceBrut = texte(form.get("contactUrgenceTel"), 30);
  const contactUrgenceTel = telUrgenceBrut ? normalizePhone(telUrgenceBrut) : null;
  if (telUrgenceBrut && !contactUrgenceTel) retour(t("Numéro de la personne à prévenir invalide. Exemple : 77 123 45 67"));

  const situation = texte(form.get("situationFamiliale"), 20);
  const statut = texte(form.get("statutPro"), 20);
  const justificatifs = justificatifsValides(form.getAll("justificatifs").map(String));
  const signature = texte(form.get("signature"), 260_000);
  if (signature && !signatureValide(signature)) retour(t("La signature n'a pas pu être enregistrée. Signez à nouveau."));
  const consent = form.get("consentement") === "on";
  const maintenant = new Date();

  const data = {
    nomComplet,
    cni: texte(form.get("cni"), 40) || null,
    cniNorm: normaliserCni(texte(form.get("cni"), 40)),
    profession: texte(form.get("profession"), 100) || null,
    dateNaissance,
    lieuNaissance: texte(form.get("lieuNaissance"), 100) || null,
    dernierDomicile: texte(form.get("dernierDomicile"), 200) || null,
    contactUrgenceNom: texte(form.get("contactUrgenceNom"), 100) || null,
    contactUrgenceTel,
    situationFamiliale: situationValide(situation) ? situation : null,
    enfantsMineurs: entier(form.get("enfantsMineurs")),
    enfantsMajeurs: entier(form.get("enfantsMajeurs")),
    statutPro: statutProValide(statut) ? statut : null,
    lieuTravail: texte(form.get("lieuTravail"), 200) || null,
    justificatifs,
    ficheRemplieLe: maintenant,
    // Le consentement n'est enregistré qu'une fois ; le décocher le retire explicitement.
    consentementHistoriqueLe: consent ? (loc.consentementHistoriqueLe ?? maintenant) : null,
    ...(signature ? { signature, signeLe: maintenant } : {}),
  };

  await db.$transaction([
    db.locataire.update({ where: { id: loc.id }, data }),
    db.journalAction.create({ data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "locataire.fiche", cible: loc.id } }),
  ]);
  if (!loc.ficheRemplieLe) {
    await notifierSansEchec({ organisationId: membre.organisationId, categorie: "LOCATAIRES", titre: N_("Fiche locataire complétée"), texte: N_("La fiche de {locataire} est enregistrée."), donnees: { locataire: loc.nomComplet }, lien: `/locataires/${loc.id}`, sauf: user.id });
  }
  redirect(`/locataires/${loc.id}?fiche=ok`);
}

const CATEGORIES = ["CNI", "BULLETIN", "ATTESTATION", "AUTRE"];

async function autoriseDocuments(locataireId: string) {
  const { t } = await getT();
  const retour = (m: string): never => redirect(`/locataires/${locataireId}/fiche?erreur=${encodeURIComponent(m)}`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE" || !peutAcceder(membre, "PATRIMOINE")) retour(t("Votre rôle ne permet pas de modifier les documents."));
  if (!etatAcces(membre.organisation.abonnement).ecriture) retour(t("Accès en lecture seule : activez un abonnement."));
  const loc = await db.locataire.findFirst({ where: { id: locataireId, organisationId: membre.organisationId } });
  if (!loc) redirect("/locataires");
  return { user, loc, orgId: membre.organisationId, retour, t };
}

/** Ajoute des documents (pièce d'identité, bulletin…) au dossier du locataire. */
export async function ajouterDocuments(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, loc, orgId, retour, t } = await autoriseDocuments(id);
  const categorie = texte(form.get("categorie"), 20);
  if (!CATEGORIES.includes(categorie)) retour(t("Choisissez le type de document."));
  const fichiers = form.getAll("fichiers").filter((f): f is File => f instanceof File && f.size > 0);
  if (!fichiers.length) retour(t("Choisissez au moins un fichier."));
  if (fichiers.reduce((s, f) => s + f.size, 0) > 20 * 1024 * 1024) retour(t("Envoi trop lourd (20 Mo au total). Envoyez moins de fichiers à la fois."));

  for (const f of fichiers) {
    const nb = await db.documentLocataire.count({ where: { locataireId: loc.id } });
    if (nb >= MAX_DOCUMENTS) retour(t("Maximum {n} documents par locataire.", { n: MAX_DOCUMENTS }));
    if (f.size > MAX_OCTETS_DOCUMENT) retour(t("« {nom} » dépasse 6 Mo.", { nom: f.name }));
    const contenu = new Uint8Array(await f.arrayBuffer());
    const detecte = typeDocument(contenu);
    if (!detecte) retour(t("« {nom} » n'est pas une image JPEG, PNG, WebP ou un PDF.", { nom: f.name }));
    const nom = await enregistrerDocument(contenu, detecte!.ext);
    await db.documentLocataire.create({ data: { locataireId: loc.id, organisationId: orgId, categorie, fichier: nom, type: detecte!.type, taille: contenu.length } });
  }
  // Le justificatif correspondant est coché automatiquement.
  if (!loc.justificatifs.includes(categorie)) {
    await db.locataire.update({ where: { id: loc.id }, data: { justificatifs: { set: [...loc.justificatifs, categorie] } } });
  }
  await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "locataire.documents_ajoutes", cible: loc.id } });
  redirect(`/locataires/${loc.id}/fiche?ok=${encodeURIComponent(t("Document ajouté."))}`);
}

export async function supprimerDocument(form: FormData) {
  const id = texte(form.get("id"), 40);
  const { user, loc, orgId, t } = await autoriseDocuments(id);
  const doc = await db.documentLocataire.findFirst({ where: { id: texte(form.get("docId"), 40), locataireId: loc.id, organisationId: orgId } });
  if (doc) {
    await db.documentLocataire.delete({ where: { id: doc.id } });
    await supprimerDocumentFichier(doc.fichier);
    await db.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "locataire.document_supprime", cible: loc.id } });
  }
  redirect(`/locataires/${loc.id}/fiche?ok=${encodeURIComponent(t("Document supprimé."))}`);
}

/**
 * Efface les données personnelles d'un ancien locataire (droit à l'effacement) tout en conservant
 * les montants, échéances et quittances nécessaires à la comptabilité du bailleur.
 */
export async function anonymiserLocataire(form: FormData) {
  const { t } = await getT();
  const id = texte(form.get("id"), 40);
  const retour = (m: string): never => redirect(`/locataires/${id}?erreur=${encodeURIComponent(m)}`);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE" || !peutAcceder(membre, "PATRIMOINE")) retour(t("Votre rôle ne permet pas de supprimer des données."));
  if (!etatAcces(membre.organisation.abonnement).ecriture) retour(t("Accès en lecture seule : activez un abonnement."));
  if (form.get("confirmer") !== "on") retour(t("Cochez la case pour confirmer la suppression."));
  const loc = await db.locataire.findFirst({ where: { id, organisationId: membre.organisationId }, include: { baux: { select: { actif: true } }, documents: true } });
  if (!loc) redirect("/locataires");
  if (loc.baux.some((b) => b.actif)) retour(t("Ce locataire a encore un bail en cours : enregistrez d'abord son départ."));

  for (const d of loc.documents) await supprimerDocumentFichier(d.fichier);
  await db.$transaction([
    db.documentLocataire.deleteMany({ where: { locataireId: loc.id } }),
    db.message.updateMany({ where: { organisationId: membre.organisationId, destinataire: loc.telephone }, data: { destinataire: "supprimé" } }),
    db.locataire.update({
      where: { id: loc.id },
      data: {
        nomComplet: "Locataire supprimé",
        telephone: "+221000000000",
        cni: null,
        cniNorm: null,
        profession: null,
        dateNaissance: null,
        lieuNaissance: null,
        dernierDomicile: null,
        contactUrgenceNom: null,
        contactUrgenceTel: null,
        situationFamiliale: null,
        enfantsMineurs: null,
        enfantsMajeurs: null,
        statutPro: null,
        lieuTravail: null,
        justificatifs: [],
        ficheRemplieLe: null,
        consentementHistoriqueLe: null,
        signature: null,
        signeLe: null,
      },
    }),
    db.journalAction.create({ data: { organisationId: membre.organisationId, utilisateurId: user.id, action: "locataire.anonymise", cible: loc.id } }),
  ]);
  redirect(`/locataires/${loc.id}?fiche=efface`);
}
