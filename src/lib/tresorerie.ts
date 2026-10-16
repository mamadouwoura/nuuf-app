import { db } from "./db";
import { N_ } from "./i18n/translate";

export const CATEGORIES_SORTIE = [N_("Travaux et entretien"), N_("Frais administratifs"), N_("Salaires et commissions"), N_("Loyer et charges du bureau"), N_("Marketing"), N_("Impôts et taxes"), N_("Autre")] as const;
export const MODES_PAIEMENT = [
  { code: "ESPECES", libelle: N_("Espèces") },
  { code: "WAVE", libelle: "Wave" },
  { code: "ORANGE_MONEY", libelle: "Orange Money" },
  { code: "VIREMENT", libelle: N_("Virement") },
  { code: "CHEQUE", libelle: N_("Chèque") },
] as const;

export const CATEGORIES_ENTREE = [N_("Frais de dossier"), N_("Honoraires de location"), N_("Autre")] as const;

const finDeMois = (m: Date) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));

/** Solde cumulé de tout ce qui précède le mois : ce que l'agence a reçu moins ce qu'elle a reversé, avancé ou dépensé. */
export async function soldeAvant(organisationId: string, mois: Date) {
  const [loyers, entrees, depenses, reversements, avances, remboursements] = await Promise.all([
    db.paiement.aggregate({ where: { statut: "CONFIRME", recuLe: { lt: mois }, echeance: { bail: { bien: { organisationId } } } }, _sum: { montant: true } }),
    db.transaction.aggregate({ where: { organisationId, sens: "ENTREE", date: { lt: mois } }, _sum: { montant: true } }),
    db.transaction.aggregate({ where: { organisationId, sens: "SORTIE", date: { lt: mois } }, _sum: { montant: true } }),
    db.reversement.aggregate({ where: { organisationId, reverseLe: { lt: mois } }, _sum: { montant: true } }),
    db.avanceProprietaire.aggregate({ where: { organisationId, accordeLe: { lt: mois } }, _sum: { montant: true } }),
    db.remboursementAvance.aggregate({ where: { organisationId, mois: null, recuLe: { lt: mois } }, _sum: { montant: true } }),
  ]);
  const v = (x: { _sum: { montant: number | null } }) => x._sum.montant ?? 0;
  return v(loyers) + v(entrees) + v(remboursements) - v(depenses) - v(reversements) - v(avances);
}

export type Tresorerie = Awaited<ReturnType<typeof tresorerieDuMois>>;

/**
 * Suivi de caisse de l'agence pour un mois : loyers reçus, autres entrées, reversements aux propriétaires,
 * avances consenties, dépenses. Indicatif : Nuuf ne détient aucun fonds, ce sont les saisies de l'agence.
 */
export async function tresorerieDuMois(organisationId: string, mois: Date) {
  const fin = finDeMois(mois);
  const [soldePrecedent, paiements, reversements, avances, remboursements, transactions] = await Promise.all([
    soldeAvant(organisationId, mois),
    db.paiement.findMany({
      where: { statut: "CONFIRME", recuLe: { gte: mois, lt: fin }, echeance: { bail: { bien: { organisationId } } } },
      select: { montant: true },
    }),
    db.reversement.findMany({ where: { organisationId, reverseLe: { gte: mois, lt: fin } }, select: { montant: true } }),
    db.avanceProprietaire.findMany({ where: { organisationId, accordeLe: { gte: mois, lt: fin } }, select: { montant: true } }),
    // Seuls les versements faits à part sont une entrée de caisse : un prélèvement sur bilan réduit le reversement.
    db.remboursementAvance.findMany({ where: { organisationId, mois: null, recuLe: { gte: mois, lt: fin } }, select: { montant: true } }),
    db.transaction.findMany({ where: { organisationId, date: { gte: mois, lt: fin } }, orderBy: [{ date: "desc" }, { creeLe: "desc" }] }),
  ]);
  const somme = (l: { montant: number }[]) => l.reduce((s, x) => s + x.montant, 0);
  const autresEntrees = somme(transactions.filter((t) => t.sens === "ENTREE"));
  const depenses = somme(transactions.filter((t) => t.sens === "SORTIE"));
  const loyers = somme(paiements);
  const entrees = loyers + autresEntrees + somme(remboursements);
  const sorties = somme(reversements) + somme(avances) + depenses;

  const parCategorie = new Map<string, number>();
  for (const t of transactions.filter((x) => x.sens === "SORTIE")) parCategorie.set(t.categorie, (parCategorie.get(t.categorie) ?? 0) + t.montant);

  return {
    mois,
    loyers,
    autresEntrees,
    remboursementsAvances: somme(remboursements),
    reversements: somme(reversements),
    avances: somme(avances),
    depenses,
    entrees,
    sorties,
    solde: entrees - sorties,
    soldePrecedent,
    soldeFinal: soldePrecedent + entrees - sorties,
    depensesParCategorie: [...parCategorie.entries()].map(([categorie, montant]) => ({ categorie, montant })).sort((a, b) => b.montant - a.montant),
    transactions,
  };
}
