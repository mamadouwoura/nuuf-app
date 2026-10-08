"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import type { TypeBien } from "@prisma/client";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { FORFAITS } from "@/lib/forfaits";
import { normalizePhone } from "@/lib/security";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

const TYPES: TypeBien[] = ["APPARTEMENT", "VILLA", "STUDIO", "COMMERCIAL"];
const chiffres = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\D/g, "")) || 0;
const texte = (v: FormDataEntryValue | null) => String(v ?? "").trim();
function echec(msg: string): never {
  redirect(`/biens/nouveau?erreur=${encodeURIComponent(msg)}`);
}

export async function creerBienEtLocataire(form: FormData) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE") echec(t("Votre rôle ne permet pas d'ajouter un bien."));
  const orgId = membre.organisationId;
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour ajouter des biens."))}`);
  }

  // Quota du forfait
  const forfait = membre.organisation.abonnement?.forfait ?? "DECOUVERTE";
  const nbBiens = await db.bien.count({ where: { organisationId: orgId, archiveLe: null } });
  if (nbBiens >= FORFAITS[forfait].logements) redirect("/abonnement/limite");

  const designation = texte(form.get("designation"));
  const type = texte(form.get("type")) as TypeBien;
  const [quartier, ...reste] = texte(form.get("quartier")).split(", ");
  const loyer = chiffres(form.get("loyer"));
  const caution = chiffres(form.get("caution"));
  const telephone = normalizePhone(texte(form.get("locTel")));
  const locNom = texte(form.get("locNom"));
  const debut = new Date(texte(form.get("debut")));
  const jour = chiffres(form.get("jour")) || 5;

  if (designation.length < 3) echec(t("Indiquez la désignation du bien."));
  if (!TYPES.includes(type)) echec(t("Choisissez un type de bien."));
  if (locNom.length < 3) echec(t("Indiquez le nom du locataire."));
  if (!telephone) echec(t("Numéro du locataire invalide. Exemple : 77 123 45 67"));
  if (loyer <= 0) echec(t("Indiquez le loyer mensuel."));
  if (Number.isNaN(debut.getTime())) echec(t("Indiquez la date de prise d'effet."));

  const surface = chiffres(form.get("surfaceM2"));
  const bien = await db.$transaction(async (tx) => {
    const bien = await tx.bien.create({
      data: {
        organisationId: orgId,
        designation,
        type,
        quartier,
        ville: reste.join(", ") || "Dakar",
        surfaceM2: surface || null,
        description: [
          texte(form.get("compteurElec")) && `Compteur Woyofal : ${texte(form.get("compteurElec"))}`,
          texte(form.get("compteurEau")) && `Sous-compteur SEN'EAU : ${texte(form.get("compteurEau"))}`,
        ].filter(Boolean).join("\n") || null,
      },
    });
    const locataire = await tx.locataire.create({
      data: {
        organisationId: orgId,
        nomComplet: locNom,
        telephone,
        cni: texte(form.get("locCni")) || null,
        profession: texte(form.get("locProfession")) || null,
      },
    });
    const bail = await tx.bail.create({
      data: {
        bienId: bien.id,
        locataireId: locataire.id,
        loyerMensuel: loyer,
        cautionMois: loyer ? Math.round(caution / loyer) : 0,
        jourEcheance: jour,
        debutLe: debut,
      },
    });
    // Première échéance : mois de prise d'effet
    const mois = new Date(Date.UTC(debut.getFullYear(), debut.getMonth(), 1));
    await tx.echeance.create({
      data: {
        bailId: bail.id,
        mois,
        montantDu: loyer,
        dateLimite: new Date(Date.UTC(debut.getFullYear(), debut.getMonth(), jour)),
        jetonPaiement: randomBytes(16).toString("hex"),
        jetonExpireLe: new Date(Date.now() + 72 * 3_600_000),
      },
    });
    await tx.journalAction.create({
      data: { organisationId: orgId, utilisateurId: user.id, action: "bien.cree", cible: bien.id },
    });
    return bien;
  });

  redirect(`/biens/${bien.id}`);
}

async function bienAutorise(id: string) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE") redirect(`/biens/${id}`);
  if (!etatAcces(membre.organisation.abonnement).ecriture) {
    redirect(`/abonnement/forfait?erreur=${encodeURIComponent(t("Votre accès est en lecture seule. Activez un abonnement pour modifier vos biens."))}`);
  }
  const bien = await db.bien.findFirst({
    where: { id, organisationId: membre.organisationId, archiveLe: null },
    include: { baux: { where: { actif: true }, take: 1 } },
  });
  if (!bien) redirect("/biens");
  return { user, bien, orgId: membre.organisationId };
}

const debutDuMois = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), 1));
};

export async function modifierBien(form: FormData) {
  const { t } = await getT();
  const id = texte(form.get("id"));
  const { user, bien, orgId } = await bienAutorise(id);
  const retour = (msg: string): never => redirect(`/biens/${id}/modifier?erreur=${encodeURIComponent(msg)}`);

  const designation = texte(form.get("designation"));
  const type = texte(form.get("type")) as TypeBien;
  const quartier = texte(form.get("quartier"));
  const ville = texte(form.get("ville")) || "Dakar";
  if (designation.length < 3) retour(t("Indiquez la désignation du bien."));
  if (!TYPES.includes(type)) retour(t("Choisissez un type de bien."));
  if (quartier.length < 2) retour(t("Indiquez le quartier."));

  const bail = bien.baux[0];
  const loyer = chiffres(form.get("loyer"));
  const jour = Math.min(28, Math.max(1, chiffres(form.get("jour")) || 5));
  const locNom = texte(form.get("locNom"));
  const locTel = normalizePhone(texte(form.get("locTel")));
  if (bail) {
    if (loyer <= 0) retour(t("Indiquez le loyer mensuel."));
    if (locNom.length < 3) retour(t("Indiquez le nom du locataire."));
    if (!locTel) retour(t("Numéro du locataire invalide. Exemple : 77 123 45 67"));
  }

  await db.$transaction(async (tx) => {
    await tx.bien.update({
      where: { id },
      data: { designation, type, quartier, ville, adresse: texte(form.get("adresse")) || null, surfaceM2: chiffres(form.get("surfaceM2")) || null },
    });
    if (bail) {
      await tx.locataire.update({ where: { id: bail.locataireId }, data: { nomComplet: locNom, telephone: locTel! } });
      await tx.bail.update({ where: { id: bail.id }, data: { loyerMensuel: loyer, jourEcheance: jour } });
      // Le nouveau loyer s'applique aux échéances à venir non encore réglées, jamais à l'historique.
      const aVenir = await tx.echeance.findMany({
        where: { bailId: bail.id, mois: { gte: debutDuMois() }, statut: { not: "PAYEE" }, paiements: { none: { statut: "CONFIRME" } } },
      });
      for (const e of aVenir) {
        await tx.echeance.update({
          where: { id: e.id },
          data: { montantDu: loyer, dateLimite: new Date(Date.UTC(e.mois.getUTCFullYear(), e.mois.getUTCMonth(), jour)) },
        });
      }
    }
    await tx.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.modifie", cible: id } });
  });
  redirect(`/biens/${id}?ok=1`);
}

/** Archive un bien : le bail prend fin, les échéances à venir non réglées sont supprimées, l'historique est conservé. */
export async function archiverBien(form: FormData) {
  const id = texte(form.get("id"));
  const { user, bien, orgId } = await bienAutorise(id);
  await db.$transaction(async (tx) => {
    const ids = bien.baux.map((b) => b.id);
    await tx.echeance.deleteMany({
      where: { bailId: { in: ids }, mois: { gte: debutDuMois() }, paiements: { none: {} } },
    });
    await tx.bail.updateMany({ where: { id: { in: ids } }, data: { actif: false, finLe: new Date() } });
    await tx.bien.update({ where: { id }, data: { archiveLe: new Date() } });
    await tx.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "bien.archive", cible: id } });
  });
  redirect("/biens?archive=1");
}
