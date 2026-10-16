import { db } from "./db";
import { N_ } from "./i18n/translate";
import { assurerEcheances, debutMois, moisPrecedent } from "./loyers";

const JOUR = 86_400_000;

/** Tranches d'ancienneté d'un impayé, en jours de retard après la date limite. */
export const TRANCHES = [
  { cle: "0-30", libelle: N_("1 à 30 jours"), min: 1, max: 30 },
  { cle: "31-60", libelle: N_("31 à 60 jours"), min: 31, max: 60 },
  { cle: "61-90", libelle: N_("61 à 90 jours"), min: 61, max: 90 },
  { cle: "90+", libelle: N_("Plus de 90 jours"), min: 91, max: Infinity },
] as const;

/** Nombre de jours de retard (entier, 0 si la date limite n'est pas dépassée). */
export const joursDeRetard = (dateLimite: Date, now: Date) => Math.max(0, Math.floor((now.getTime() - dateLimite.getTime()) / JOUR));

export const trancheDe = (jours: number) => TRANCHES.find((t) => jours >= t.min && jours <= t.max) ?? null;

/** Taux en pourcentage entier ; 0 quand rien n'était attendu. */
export const taux = (partie: number, total: number) => (total > 0 ? Math.round((partie / total) * 100) : 0);

export type Statistiques = Awaited<ReturnType<typeof statistiques>>;

/**
 * Indicateurs d'une organisation pour un mois : recouvrement, occupation, tendance sur 6 mois,
 * résultat par propriétaire et arriérés par ancienneté (tous mois confondus).
 */
export async function statistiques(organisationId: string, mois: Date, now = new Date()) {
  if (mois <= debutMois(now)) await assurerEcheances(organisationId, mois);
  const debutTendance = moisPrecedent(mois, 5);

  const [echeances, biens, occupes, impayes] = await Promise.all([
    db.echeance.findMany({
      where: { mois: { gte: debutTendance, lte: mois }, bail: { bien: { organisationId } } },
      select: {
        mois: true,
        montantDu: true,
        paiements: { where: { statut: "CONFIRME" }, select: { montant: true } },
        bail: { select: { bien: { select: { proprietaire: { select: { id: true, nomComplet: true } } } } } },
      },
    }),
    db.bien.count({ where: { organisationId, archiveLe: null } }),
    db.bien.count({ where: { organisationId, archiveLe: null, baux: { some: { actif: true } } } }),
    db.echeance.findMany({
      where: { dateLimite: { lt: now }, statut: { in: ["EN_ATTENTE", "PARTIELLE"] }, bail: { bien: { organisationId } } },
      select: {
        id: true,
        mois: true,
        montantDu: true,
        dateLimite: true,
        paiements: { where: { statut: "CONFIRME" }, select: { montant: true } },
        bail: { select: { locataire: { select: { id: true, nomComplet: true } }, bien: { select: { designation: true } } } },
      },
    }),
  ]);

  const encaisseDe = (e: { paiements: { montant: number }[] }) => e.paiements.reduce((s, p) => s + p.montant, 0);

  const tendance = Array.from({ length: 6 }, (_, i) => {
    const m = moisPrecedent(mois, 5 - i);
    const du = echeances.filter((e) => e.mois.getTime() === m.getTime());
    const attendu = du.reduce((s, e) => s + e.montantDu, 0);
    const encaisse = du.reduce((s, e) => s + Math.min(e.montantDu, encaisseDe(e)), 0);
    return { mois: m, attendu, encaisse, taux: taux(encaisse, attendu) };
  });
  const courant = tendance[5];

  const parProprietaire = new Map<string, { id: string | null; nom: string | null; attendu: number; encaisse: number }>();
  for (const e of echeances.filter((x) => x.mois.getTime() === mois.getTime())) {
    const p = e.bail.bien.proprietaire;
    const cle = p?.id ?? "aucun";
    const ligne = parProprietaire.get(cle) ?? { id: p?.id ?? null, nom: p?.nomComplet ?? null, attendu: 0, encaisse: 0 };
    ligne.attendu += e.montantDu;
    ligne.encaisse += Math.min(e.montantDu, encaisseDe(e));
    parProprietaire.set(cle, ligne);
  }

  const arrieres = impayes
    .map((e) => ({
      echeanceId: e.id,
      locataireId: e.bail.locataire.id,
      locataire: e.bail.locataire.nomComplet,
      bien: e.bail.bien.designation,
      mois: e.mois,
      reste: Math.max(0, e.montantDu - encaisseDe(e)),
      jours: joursDeRetard(e.dateLimite, now),
    }))
    .filter((a) => a.reste > 0 && a.jours > 0);
  const tranches = TRANCHES.map((t) => {
    const l = arrieres.filter((a) => a.jours >= t.min && a.jours <= t.max);
    return { ...t, nb: l.length, montant: l.reduce((s, a) => s + a.reste, 0) };
  });

  return {
    mois,
    attendu: courant.attendu,
    encaisse: courant.encaisse,
    reste: courant.attendu - courant.encaisse,
    tauxRecouvrement: courant.taux,
    tendance,
    occupation: { biens, occupes, vacants: biens - occupes, taux: taux(occupes, biens) },
    parProprietaire: [...parProprietaire.values()]
      .map((p) => ({ ...p, taux: taux(p.encaisse, p.attendu) }))
      .sort((a, b) => b.attendu - a.attendu),
    arrieres: {
      total: arrieres.reduce((s, a) => s + a.reste, 0),
      nb: arrieres.length,
      tranches,
      plusAnciens: [...arrieres].sort((a, b) => b.jours - a.jours || b.reste - a.reste).slice(0, 8),
    },
  };
}
