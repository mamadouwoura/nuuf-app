"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { IMPORT_MAX_OCTETS, decoderFichier, norm } from "@/lib/csv";
import { analyserFichier, apercuRecent } from "@/lib/import-analyse";
import { normaliserCni } from "@/lib/fiche";
import { analyserBiens, analyserProprietaires, type TypeImport } from "@/lib/import";
import { notifierSansEchec } from "@/lib/notifications";
import { peutAcceder } from "@/lib/permissions";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

const retourImport = (cle: "ok" | "erreur" | "apercu", m: string): never => redirect(`/import?${cle}=${encodeURIComponent(m)}`);

async function autorise(type: TypeImport) {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre || membre.role === "LECTURE_SEULE") return { refus: t("Votre rôle ne permet pas d'importer des données.") } as const;
  if (!peutAcceder(membre, type === "biens" ? "PATRIMOINE" : "GERANCE")) return { refus: t("Votre accès ne comprend pas ce module.") } as const;
  if (!etatAcces(membre.organisation.abonnement).ecriture) return { refus: t("Accès en lecture seule : activez un abonnement pour importer.") } as const;
  return { user, membre, t } as const;
}

/** Étape 1 : lit le fichier envoyé, le garde une heure au plus et ouvre l'aperçu ligne par ligne. Rien n'est importé. */
export async function analyserImport(form: FormData) {
  const type: TypeImport = form.get("type") === "biens" ? "biens" : "proprietaires";
  const a = await autorise(type);
  if (a.refus !== undefined) return retourImport("erreur", a.refus);
  const { user, membre, t } = a;
  const fichier = form.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) return retourImport("erreur", t("Choisissez un fichier CSV."));
  if (fichier.size > IMPORT_MAX_OCTETS) return retourImport("erreur", t("Le fichier est trop lourd (200 Ko maximum)."));
  const csv = decoderFichier(new Uint8Array(await fichier.arrayBuffer()));
  const r = await analyserFichier(type, csv, membre.organisationId, membre.organisation.abonnement);
  if (!r.ok) return retourImport("erreur", t(r.erreur, r.vars));
  if (r.analyse.manquantes.length) return retourImport("erreur", t("Colonne obligatoire introuvable : {colonnes}.", { colonnes: r.analyse.manquantes.map((c) => t(c)).join(", ") }));
  // Nettoyage des anciens aperçus de l'utilisateur, puis nouvel aperçu.
  await db.importApercu.deleteMany({ where: { OR: [{ utilisateurId: user.id }, { creeLe: { lt: new Date(Date.now() - 3_600_000) } }] } });
  const apercu = await db.importApercu.create({ data: { organisationId: membre.organisationId, utilisateurId: user.id, type, csv } });
  redirect(`/import?apercu=${apercu.id}`);
}

/** Étape 2 : revalide le texte reçu (on ne fait jamais confiance à l'aperçu) puis crée tout dans une seule transaction. */
export async function confirmerImport(form: FormData) {
  const retour = retourImport;
  const user0 = await getUser();
  if (!user0) redirect("/connexion");
  const enregistre = await apercuRecent(String(form.get("apercu") ?? ""), user0.id, user0.membres[0]?.organisationId ?? "");
  if (!enregistre) return retour("erreur", (await getT()).t("Cet aperçu a expiré : envoyez de nouveau le fichier."));
  const type: TypeImport = enregistre.type === "biens" ? "biens" : "proprietaires";
  const a = await autorise(type);
  if (a.refus !== undefined) return retour("erreur", a.refus);
  const { user, membre, t } = a;
  const orgId = membre.organisationId;
  const csv = enregistre.csv;
  const r = await analyserFichier(type, csv, orgId, membre.organisation.abonnement);
  if (!r.ok) return retour("erreur", t(r.erreur, r.vars));
  if (r.analyse.lignes.some((l) => l.statut === "erreur")) retour("erreur", t("Corrigez les lignes en erreur, puis recommencez l'import."));
  // Consommé une seule fois : un double clic ne peut pas importer deux fois.
  const consomme = await db.importApercu.deleteMany({ where: { id: enregistre.id } });
  if (consomme.count === 0) retour("erreur", t("Cet aperçu a déjà été utilisé."));

  if (r.type === "proprietaires") {
    const lignes = (r.analyse as ReturnType<typeof analyserProprietaires>).valides;
    if (lignes.length === 0) retour("erreur", t("Rien de nouveau à importer."));
    await db.$transaction(async (tx) => {
      await tx.proprietaire.createMany({ data: lignes.map((p) => ({ organisationId: orgId, ...p })) });
      await tx.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "import.proprietaires", cible: String(lignes.length) } });
    });
    await notifierSansEchec({ organisationId: orgId, categorie: "PROPRIETAIRES", titre: N_("Import de propriétaires"), texte: N_("{n} propriétaire(s) importé(s)."), donnees: { n: lignes.length }, lien: "/proprietaires", sauf: user.id });
    revalidatePath("/proprietaires");
    retour("ok", t("{n} propriétaire(s) importé(s).", { n: lignes.length }));
  }

  const lignes = (r.analyse as ReturnType<typeof analyserBiens>).valides;
  if (lignes.length === 0) retour("erreur", t("Rien de nouveau à importer."));
  const proprietaires = await db.proprietaire.findMany({ where: { organisationId: orgId }, select: { id: true, nomComplet: true } });
  const idDe = new Map(proprietaires.map((p) => [norm(p.nomComplet), p.id]));
  await db.$transaction(
    async (tx) => {
      for (const b of lignes) {
        const bien = await tx.bien.create({
          data: { organisationId: orgId, designation: b.designation, type: b.type, quartier: b.quartier, ville: b.ville, proprietaireId: b.proprietaireNom ? (idDe.get(norm(b.proprietaireNom)) ?? null) : null },
        });
        if (!b.locataire || !b.debut) continue;
        const locataire = await tx.locataire.create({
          data: { organisationId: orgId, nomComplet: b.locataire.nom, telephone: b.locataire.telephone, cni: b.locataire.cni, cniNorm: normaliserCni(b.locataire.cni) },
        });
        const bail = await tx.bail.create({
          data: { bienId: bien.id, locataireId: locataire.id, loyerMensuel: b.loyer, cautionMois: b.cautionMois, jourEcheance: b.jour, debutLe: b.debut },
        });
        // Première échéance : mois de prise d'effet, comme à la création d'un bien.
        await tx.echeance.create({
          data: {
            bailId: bail.id,
            mois: new Date(Date.UTC(b.debut.getUTCFullYear(), b.debut.getUTCMonth(), 1)),
            montantDu: b.loyer,
            dateLimite: new Date(Date.UTC(b.debut.getUTCFullYear(), b.debut.getUTCMonth(), b.jour)),
            jetonPaiement: randomBytes(16).toString("hex"),
            jetonExpireLe: new Date(Date.now() + 72 * 3_600_000),
          },
        });
      }
      await tx.journalAction.create({ data: { organisationId: orgId, utilisateurId: user.id, action: "import.biens", cible: String(lignes.length) } });
    },
    { timeout: 60_000, maxWait: 10_000 },
  );
  await notifierSansEchec({ organisationId: orgId, categorie: "BIENS", titre: N_("Import de biens"), texte: N_("{n} bien(s) importé(s)."), donnees: { n: lignes.length }, lien: "/biens", sauf: user.id });
  revalidatePath("/biens");
  revalidatePath("/tableau-de-bord");
  retour("ok", t("{n} bien(s) importé(s).", { n: lignes.length }));
}
