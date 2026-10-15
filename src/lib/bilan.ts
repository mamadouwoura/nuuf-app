import { db } from "./db";
import { assurerEcheances, debutMois } from "./loyers";

export type LigneBilan = {
  bienId: string;
  designation: string;
  locataire: string | null;
  montantDu: number;
  encaisse: number;
  reste: number;
  etat: "PAYE" | "PARTIEL" | "IMPAYE";
};

export type Bilan = {
  proprietaire: { id: string; nomComplet: string; telephone: string | null; adresse: string | null };
  mois: Date;
  mandat: { id: string; numero: string; commissionPct: number; jourReversement: number } | null;
  commissionPct: number;
  lignes: LigneBilan[];
  attendu: number;
  encaisse: number;
  impayes: number;
  commission: number;
  retenues: { id: string; libelle: string; montant: number }[];
  totalRetenues: number;
  net: number;
  reversement: { montant: number; reverseLe: Date; reference: string | null } | null;
};

/** Commission en FCFA entiers sur le montant encaissé. */
export const commissionSur = (encaisse: number, pct: number) => Math.round((encaisse * pct) / 100);

/**
 * Compte rendu de gérance d'un propriétaire pour un mois : loyers attendus et encaissés bien par bien,
 * commission de l'agence (mandat actif), retenues, net à reverser. Uniquement les biens de l'organisation.
 */
export async function calculerBilan(organisationId: string, proprietaireId: string, mois: Date, now = new Date()): Promise<Bilan | null> {
  const proprietaire = await db.proprietaire.findFirst({ where: { id: proprietaireId, organisationId } });
  if (!proprietaire) return null;
  if (mois <= debutMois(now)) await assurerEcheances(organisationId, mois);

  const [echeances, mandat, retenues, reversement] = await Promise.all([
    db.echeance.findMany({
      where: { mois, bail: { bien: { organisationId, proprietaireId } } },
      include: {
        paiements: { where: { statut: "CONFIRME" }, select: { montant: true } },
        bail: { include: { bien: { select: { id: true, designation: true } }, locataire: { select: { nomComplet: true } } } },
      },
      orderBy: { dateLimite: "asc" },
    }),
    db.mandat.findFirst({ where: { organisationId, proprietaireId, actif: true }, orderBy: { creeLe: "desc" } }),
    db.retenueBilan.findMany({ where: { organisationId, proprietaireId, mois }, orderBy: { creeLe: "asc" } }),
    db.reversement.findUnique({ where: { proprietaireId_mois: { proprietaireId, mois } } }),
  ]);

  const lignes: LigneBilan[] = echeances.map((e) => {
    const encaisse = e.paiements.reduce((s, p) => s + p.montant, 0);
    const reste = Math.max(0, e.montantDu - encaisse);
    return {
      bienId: e.bail.bien.id,
      designation: e.bail.bien.designation,
      locataire: e.bail.locataire.nomComplet,
      montantDu: e.montantDu,
      encaisse,
      reste,
      etat: reste === 0 ? "PAYE" : encaisse > 0 ? "PARTIEL" : "IMPAYE",
    };
  });
  const attendu = lignes.reduce((s, l) => s + l.montantDu, 0);
  const encaisse = lignes.reduce((s, l) => s + l.encaisse, 0);
  const impayes = lignes.reduce((s, l) => s + l.reste, 0);
  const commissionPct = mandat?.commissionPct ?? 0;
  const commission = commissionSur(encaisse, commissionPct);
  const totalRetenues = retenues.reduce((s, r) => s + r.montant, 0);

  return {
    proprietaire: { id: proprietaire.id, nomComplet: proprietaire.nomComplet, telephone: proprietaire.telephone, adresse: proprietaire.adresse },
    mois,
    mandat: mandat ? { id: mandat.id, numero: mandat.numero, commissionPct: mandat.commissionPct, jourReversement: mandat.jourReversement } : null,
    commissionPct,
    lignes,
    attendu,
    encaisse,
    impayes,
    commission,
    retenues: retenues.map((r) => ({ id: r.id, libelle: r.libelle, montant: r.montant })),
    totalRetenues,
    net: encaisse - commission - totalRetenues,
    reversement: reversement ? { montant: reversement.montant, reverseLe: reversement.reverseLe, reference: reversement.reference } : null,
  };
}

/** Synthèse de tous les propriétaires de l'organisation pour un mois. */
export async function recapitulatifDuMois(organisationId: string, mois: Date, now = new Date()) {
  const proprietaires = await db.proprietaire.findMany({ where: { organisationId }, orderBy: { nomComplet: "asc" }, select: { id: true } });
  const bilans: Bilan[] = [];
  for (const p of proprietaires) {
    const b = await calculerBilan(organisationId, p.id, mois, now);
    if (b) bilans.push(b);
  }
  const somme = (k: "attendu" | "encaisse" | "impayes" | "commission" | "totalRetenues" | "net") => bilans.reduce((s, b) => s + b[k], 0);
  return {
    bilans,
    attendu: somme("attendu"),
    encaisse: somme("encaisse"),
    impayes: somme("impayes"),
    commission: somme("commission"),
    retenues: somme("totalRetenues"),
    net: somme("net"),
    aReverser: bilans.filter((b) => !b.reversement && b.net > 0).reduce((s, b) => s + b.net, 0),
  };
}

/** Numéro de mandat séquentiel par organisation et par année : MG-2026-001. */
export async function prochainNumeroMandat(organisationId: string, annee = new Date().getUTCFullYear()) {
  const n = await db.mandat.count({ where: { organisationId, numero: { startsWith: `MG-${annee}-` } } });
  return `MG-${annee}-${String(n + 1).padStart(3, "0")}`;
}
