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

/** Avance consentie au propriétaire et part remboursée sur ce bilan. */
export type LigneAvance = {
  id: string;
  motif: string | null;
  montantInitial: number;
  resteDebut: number;
  prelevement: number;
  resteApres: number;
  /** Vrai quand le prélèvement est déjà enregistré (mois reversé) et ne bouge plus. */
  fige: boolean;
};

export type Bilan = {
  proprietaire: { id: string; nomComplet: string; telephone: string | null; adresse: string | null };
  mois: Date;
  mandat: { id: string; numero: string; commissionPct: number; jourReversement: number; agentNom: string | null; commissionAgentPct: number } | null;
  commissionPct: number;
  lignes: LigneBilan[];
  attendu: number;
  encaisse: number;
  impayes: number;
  commission: number;
  /** Part de la commission reversée à l'agent apporteur (interne à l'agence, absente du compte rendu du propriétaire). */
  commissionAgent: number;
  /** Ce qui reste à l'agence après l'agent. */
  margeAgence: number;
  retenues: { id: string; libelle: string; montant: number }[];
  totalRetenues: number;
  avances: LigneAvance[];
  totalAvances: number;
  net: number;
  reversement: { montant: number; reverseLe: Date; reference: string | null } | null;
};

/** Commission en FCFA entiers sur le montant encaissé. */
export const commissionSur = (encaisse: number, pct: number) => Math.round((encaisse * pct) / 100);

const moisSuivant = (m: Date) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));

/**
 * Part d'une avance remboursée sur un bilan : le moins élevé entre le reste dû, la mensualité prévue
 * et ce qu'il reste au propriétaire après commission et retenues (le net ne devient jamais négatif).
 */
export function prelevementAvance(resteDebut: number, mensualite: number | null, disponible: number) {
  return Math.max(0, Math.min(resteDebut, mensualite && mensualite > 0 ? mensualite : resteDebut, disponible));
}

/**
 * Compte rendu de gérance d'un propriétaire pour un mois : loyers attendus et encaissés bien par bien,
 * commission de l'agence (mandat actif), retenues, remboursement des avances, net à reverser.
 * Uniquement les biens de l'organisation.
 */
export async function calculerBilan(organisationId: string, proprietaireId: string, mois: Date, now = new Date()): Promise<Bilan | null> {
  const proprietaire = await db.proprietaire.findFirst({ where: { id: proprietaireId, organisationId } });
  if (!proprietaire) return null;
  if (mois <= debutMois(now)) await assurerEcheances(organisationId, mois);

  const [echeances, mandat, retenues, reversement, avances] = await Promise.all([
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
    db.avanceProprietaire.findMany({
      where: { organisationId, proprietaireId, accordeLe: { lt: moisSuivant(mois) } },
      include: { remboursements: true },
      orderBy: { accordeLe: "asc" },
    }),
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
  // L'agent est payé sur la commission de l'agence : jamais plus que celle-ci.
  const commissionAgent = Math.min(commission, commissionSur(encaisse, mandat?.commissionAgentPct ?? 0));
  const totalRetenues = retenues.reduce((s, r) => s + r.montant, 0);

  // Avances : le reste en début de mois tient compte des remboursements des mois précédents et des versements à part.
  let disponible = Math.max(0, encaisse - commission - totalRetenues);
  const lignesAvances: LigneAvance[] = [];
  for (const a of avances) {
    const dejaRembourse = a.remboursements
      .filter((r) => (r.mois ? r.mois < mois : r.recuLe < moisSuivant(mois)))
      .reduce((s, r) => s + r.montant, 0);
    const resteDebut = Math.max(0, a.montant - dejaRembourse);
    const enregistre = a.remboursements.find((r) => r.mois && r.mois.getTime() === mois.getTime());
    if (resteDebut === 0 && !enregistre) continue;
    const prelevement = enregistre ? enregistre.montant : prelevementAvance(resteDebut, a.mensualite, disponible);
    disponible -= prelevement;
    lignesAvances.push({
      id: a.id,
      motif: a.motif,
      montantInitial: a.montant,
      resteDebut,
      prelevement,
      resteApres: Math.max(0, resteDebut - prelevement),
      fige: Boolean(enregistre),
    });
  }
  const totalAvances = lignesAvances.reduce((s, l) => s + l.prelevement, 0);

  return {
    proprietaire: { id: proprietaire.id, nomComplet: proprietaire.nomComplet, telephone: proprietaire.telephone, adresse: proprietaire.adresse },
    mois,
    mandat: mandat
      ? {
          id: mandat.id,
          numero: mandat.numero,
          commissionPct: mandat.commissionPct,
          jourReversement: mandat.jourReversement,
          agentNom: mandat.agentNom,
          commissionAgentPct: mandat.commissionAgentPct,
        }
      : null,
    commissionPct,
    lignes,
    attendu,
    encaisse,
    impayes,
    commission,
    commissionAgent,
    margeAgence: commission - commissionAgent,
    retenues: retenues.map((r) => ({ id: r.id, libelle: r.libelle, montant: r.montant })),
    totalRetenues,
    avances: lignesAvances,
    totalAvances,
    net: encaisse - commission - totalRetenues - totalAvances,
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
  const somme = (k: "attendu" | "encaisse" | "impayes" | "commission" | "commissionAgent" | "margeAgence" | "totalRetenues" | "totalAvances" | "net") =>
    bilans.reduce((s, b) => s + b[k], 0);
  return {
    bilans,
    attendu: somme("attendu"),
    encaisse: somme("encaisse"),
    impayes: somme("impayes"),
    commission: somme("commission"),
    commissionAgent: somme("commissionAgent"),
    margeAgence: somme("margeAgence"),
    retenues: somme("totalRetenues"),
    avances: somme("totalAvances"),
    net: somme("net"),
    aReverser: bilans.filter((b) => !b.reversement && b.net > 0).reduce((s, b) => s + b.net, 0),
  };
}

/** Numéro de mandat séquentiel par organisation et par année : MG-2026-001. */
export async function prochainNumeroMandat(organisationId: string, annee = new Date().getUTCFullYear()) {
  const n = await db.mandat.count({ where: { organisationId, numero: { startsWith: `MG-${annee}-` } } });
  return `MG-${annee}-${String(n + 1).padStart(3, "0")}`;
}
