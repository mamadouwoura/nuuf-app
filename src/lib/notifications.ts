import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { N_ } from "./i18n/translate";
import { programmerEmails } from "./email";

/** Catégories que chaque membre peut activer ou désactiver. L'abonnement n'en fait pas partie : il reste toujours actif. */
export const CATEGORIES = [
  { code: "PAIEMENTS", libelle: N_("Paiements"), aide: N_("Loyers encaissés"), icone: "payments" },
  { code: "BAUX", libelle: N_("Baux"), aide: N_("Nouvelles locations, départs"), icone: "description" },
  { code: "BIENS", libelle: N_("Biens"), aide: N_("Biens ajoutés ou archivés"), icone: "apartment" },
  { code: "PROPRIETAIRES", libelle: N_("Propriétaires"), aide: N_("Mandats, bilans et reversements"), icone: "badge" },
  { code: "LOCATAIRES", libelle: N_("Locataires"), aide: N_("Fiches de renseignement"), icone: "group" },
  { code: "ACOMPTES", libelle: N_("Acomptes"), aide: N_("Avances aux propriétaires et remboursements"), icone: "savings" },
] as const;

export type CodeCategorie = (typeof CATEGORIES)[number]["code"] | "ABONNEMENT";

export const ICONE: Record<string, string> = { ...Object.fromEntries(CATEGORIES.map((c) => [c.code, c.icone])), ABONNEMENT: "workspace_premium" };

type Client = Prisma.TransactionClient | typeof db;

type Alerte = {
  organisationId: string;
  categorie: CodeCategorie;
  /** Modèle de texte (français, traduit à l'affichage) : utiliser N_(). */
  titre: string;
  texte?: string;
  /** Valeurs insérées dans les modèles, ex. { montant: "150 000" }. */
  donnees?: Record<string, string | number>;
  lien?: string;
  /** L'auteur de l'action n'est pas prévenu de sa propre action. */
  sauf?: string;
};

/**
 * Prévient les membres de l'organisation, sauf ceux qui ont désactivé la catégorie (et sauf l'auteur).
 * Les alertes d'abonnement sont toujours envoyées.
 */
export async function notifier(client: Client, a: Alerte): Promise<number> {
  const membres = await client.membre.findMany({ where: { organisationId: a.organisationId }, select: { utilisateurId: true } });
  let ids = [...new Set(membres.map((m) => m.utilisateurId))].filter((id) => id !== a.sauf);
  if (ids.length === 0) return 0;
  if (a.categorie !== "ABONNEMENT") {
    const coupes = await client.preferenceNotification.findMany({
      where: { utilisateurId: { in: ids }, categorie: a.categorie, actif: false },
      select: { utilisateurId: true },
    });
    const exclus = new Set(coupes.map((c) => c.utilisateurId));
    ids = ids.filter((id) => !exclus.has(id));
  }
  if (ids.length === 0) return 0;
  const cree = await client.notification.createManyAndReturn({
    select: { id: true },
    data: ids.map((utilisateurId) => ({
      organisationId: a.organisationId,
      utilisateurId,
      categorie: a.categorie,
      titre: a.titre,
      texte: a.texte ?? null,
      donnees: a.donnees ?? undefined,
      lien: a.lien ?? null,
    })),
  });
  // L'e-mail part après la réponse (jamais pendant une transaction) et seulement pour qui a renseigné son adresse.
  programmerEmails(cree.map((n) => n.id));
  return cree.length;
}

/** Variante qui ne fait jamais échouer l'action appelante (utilisée hors transaction). */
export async function notifierSansEchec(a: Alerte): Promise<void> {
  try {
    await notifier(db, a);
  } catch (e) {
    console.error("[notifications] envoi impossible", e instanceof Error ? e.message : e);
  }
}

export const compterNonLues = (utilisateurId: string) => db.notification.count({ where: { utilisateurId, luLe: null } });

/** Catégories désactivées par un utilisateur. */
export async function categoriesCoupees(utilisateurId: string): Promise<Set<string>> {
  const l = await db.preferenceNotification.findMany({ where: { utilisateurId, actif: false }, select: { categorie: true } });
  return new Set(l.map((x) => x.categorie));
}
