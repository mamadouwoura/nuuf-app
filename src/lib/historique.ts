import { db } from "./db";

/** Nombre de recherches autorisées par organisation et par 24 h (évite l'aspiration de la base). */
export const PLAFOND_CONSULTATIONS = 30;
const JOUR = 86_400_000;

export type DossierHistorique = {
  nom: string;
  agence: string;
  type: string;
  quartier: string;
  ville: string;
  debut: string;
  fin: string | null;
  enCours: boolean;
  echeances: number;
  aTemps: number;
  enRetard: number;
  impayes: number;
  motifFin: string | null;
  appreciation: { logement: string | null; regles: string | null; sortie: string | null; relouer: string | null } | null;
};

export type ResultatHistorique = {
  nom: string;
  dossiers: DossierHistorique[];
  echeances: number;
  aTemps: number;
  enRetard: number;
  impayes: number;
};

/**
 * Historique d'un candidat chez les AUTRES organisations. Ne renvoie que les dossiers où le locataire
 * a consenti (date de consentement enregistrée) : sans consentement, rien n'est révélé, pas même l'existence du dossier.
 */
export type CritereHistorique = { telephone?: string | null; cniNorm?: string | null };

export async function chercherHistorique(organisationId: string, critere: string | CritereHistorique, now = new Date()): Promise<ResultatHistorique | null> {
  const c: CritereHistorique = typeof critere === "string" ? { telephone: critere } : critere;
  const ou = [c.telephone ? { telephone: c.telephone } : null, c.cniNorm ? { cniNorm: c.cniNorm } : null].filter((x): x is NonNullable<typeof x> => x !== null);
  if (!ou.length) return null;
  const locataires = await db.locataire.findMany({
    where: { OR: ou, organisationId: { not: organisationId }, consentementHistoriqueLe: { not: null } },
    orderBy: { creeLe: "desc" },
    include: {
      organisation: { select: { nom: true } },
      baux: {
        include: {
          bien: { select: { type: true, quartier: true, ville: true } },
          echeances: { where: { dateLimite: { lt: now } }, include: { paiements: { where: { statut: "CONFIRME" }, select: { recuLe: true, creeLe: true } } } },
        },
      },
    },
  });
  const dossiers: DossierHistorique[] = [];
  for (const l of locataires) {
    for (const b of l.baux) {
      let aTemps = 0;
      let enRetard = 0;
      let impayes = 0;
      for (const e of b.echeances) {
        if (e.statut !== "PAYEE") {
          impayes++;
          continue;
        }
        const derniere = Math.max(0, ...e.paiements.map((p) => (p.recuLe ?? p.creeLe).getTime()));
        if (derniere && derniere > e.dateLimite.getTime() + JOUR) enRetard++;
        else aTemps++;
      }
      dossiers.push({
        nom: l.nomComplet,
        agence: l.organisation.nom,
        type: b.bien.type,
        quartier: b.bien.quartier,
        ville: b.bien.ville,
        debut: b.debutLe.toISOString(),
        fin: b.finLe ? b.finLe.toISOString() : null,
        enCours: b.actif,
        echeances: b.echeances.length,
        aTemps,
        enRetard,
        impayes,
        motifFin: b.actif ? null : b.motifFin,
        appreciation: b.actif ? null : { logement: b.apprLogement, regles: b.apprRegles, sortie: b.apprSortie, relouer: b.apprRelouer },
      });
    }
  }
  if (!dossiers.length) return null;
  dossiers.sort((a, b) => b.debut.localeCompare(a.debut));
  const somme = (k: "echeances" | "aTemps" | "enRetard" | "impayes") => dossiers.reduce((s, d) => s + d[k], 0);
  return { nom: locataires[0].nomComplet, dossiers, echeances: somme("echeances"), aTemps: somme("aTemps"), enRetard: somme("enRetard"), impayes: somme("impayes") };
}

export const consultationsDuJour = (organisationId: string, now = new Date()) =>
  db.consultationHistorique.count({ where: { organisationId, creeLe: { gte: new Date(now.getTime() - JOUR) } } });
