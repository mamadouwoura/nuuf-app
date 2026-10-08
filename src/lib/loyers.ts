import { db } from "./db";

/** Premier jour du mois (UTC) contenant `d`. */
export const debutMois = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
export const moisPrecedent = (d: Date, n = 1) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - n, 1));
export const cleMois = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
export const depuisCle = (cle: string | undefined, defaut: Date) => {
  const m = cle?.match(/^(\d{4})-(\d{2})$/);
  return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)) : debutMois(defaut);
};

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
export const libelleMois = (d: Date) => `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const COURTS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
export const courtMois = (d: Date) => COURTS[d.getUTCMonth()];

/** Crée les échéances manquantes du mois pour les baux actifs (idempotent). */
export async function assurerEcheances(organisationId: string, mois: Date) {
  const fin = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth() + 1, 0));
  const baux = await db.bail.findMany({
    where: { actif: true, debutLe: { lte: fin }, bien: { organisationId, archiveLe: null } },
    select: { id: true, loyerMensuel: true, jourEcheance: true, finLe: true },
  });
  const valides = baux.filter((b) => !b.finLe || b.finLe >= mois);
  if (!valides.length) return;
  await db.echeance.createMany({
    data: valides.map((b) => ({
      bailId: b.id,
      mois,
      montantDu: b.loyerMensuel,
      dateLimite: new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth(), Math.min(b.jourEcheance, 28))),
    })),
    skipDuplicates: true,
  });
}

export type LigneLoyer = Awaited<ReturnType<typeof loyersDuMois>>["lignes"][number];

/** Tout ce qu'il faut pour afficher un mois : lignes, totaux, canaux. */
export async function loyersDuMois(organisationId: string, mois: Date, now: Date) {
  const echeances = await db.echeance.findMany({
    where: { mois, bail: { bien: { organisationId } } },
    include: {
      paiements: { where: { statut: "CONFIRME" }, orderBy: { creeLe: "desc" }, include: { quittance: true } },
      bail: { include: { locataire: true, bien: true } },
    },
    orderBy: { dateLimite: "asc" },
  });

  const lignes = echeances.map((e) => {
    const paye = e.paiements.reduce((s, p) => s + p.montant, 0);
    const reste = Math.max(0, e.montantDu - paye);
    const jours = Math.floor((now.getTime() - e.dateLimite.getTime()) / 86_400_000);
    const etat: "PAYE" | "EN_RETARD" | "EN_ATTENTE" = reste === 0 ? "PAYE" : jours > 0 ? "EN_RETARD" : "EN_ATTENTE";
    return { ...e, paye, reste, jours: Math.max(0, jours), etat };
  });

  const sum = (l: typeof lignes, f: (x: (typeof lignes)[number]) => number) => l.reduce((s, x) => s + f(x), 0);
  const retards = lignes.filter((l) => l.etat === "EN_RETARD");
  const attente = lignes.filter((l) => l.etat === "EN_ATTENTE");
  const canaux = { WAVE: 0, ORANGE_MONEY: 0, ESPECES: 0, VIREMENT: 0 };
  for (const l of lignes) for (const p of l.paiements) canaux[p.canal] += p.montant;

  return {
    lignes,
    attendu: sum(lignes, (l) => l.montantDu),
    encaisse: sum(lignes, (l) => l.paye),
    montantRetard: sum(retards, (l) => l.reste),
    montantAttente: sum(attente, (l) => l.reste),
    nbRecus: lignes.filter((l) => l.etat === "PAYE").length,
    nbRetards: retards.length,
    nbAttente: attente.length,
    canaux,
  };
}

/** Encaissé par mois (Wave/OM+virement vs espèces) sur les `n` derniers mois, mois courant inclus. */
export async function encaissementsParMois(organisationId: string, mois: Date, n = 6) {
  const debut = moisPrecedent(mois, n - 1);
  const paiements = await db.paiement.findMany({
    where: { statut: "CONFIRME", echeance: { mois: { gte: debut, lte: mois }, bail: { bien: { organisationId } } } },
    select: { montant: true, canal: true, echeance: { select: { mois: true } } },
  });
  return Array.from({ length: n }, (_, i) => {
    const m = moisPrecedent(mois, n - 1 - i);
    const ps = paiements.filter((p) => cleMois(p.echeance.mois) === cleMois(m));
    const especes = ps.filter((p) => p.canal === "ESPECES").reduce((s, p) => s + p.montant, 0);
    const numerique = ps.reduce((s, p) => s + p.montant, 0) - especes;
    return { mois: m, especes, numerique, total: especes + numerique };
  });
}
