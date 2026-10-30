import { db } from "./db";

const HEURE = 3_600_000;
const entier = (v: string | undefined, defaut: number) => (Number(v) > 0 ? Number(v) : defaut);

/**
 * Trop de codes faux sur ce compte durant la dernière heure (toutes demandes de code confondues) :
 * empêche de contourner la limite de 5 essais par code en redemandant un code.
 */
export async function tropDEchecsCode(utilisateurId: string) {
  const r = await db.codeOtp.aggregate({
    where: { utilisateurId, creeLe: { gte: new Date(Date.now() - HEURE) } },
    _sum: { tentatives: true },
  });
  return (r._sum.tentatives ?? 0) >= 10;
}

/** Plafond global de codes envoyés par heure : borne le coût d'envoi en cas d'abus (OTP_MAX_PAR_HEURE, 300 par défaut). */
export async function plafondCodesAtteint() {
  const n = await db.message.count({ where: { type: "OTP", creeLe: { gte: new Date(Date.now() - HEURE) } } });
  return n >= entier(process.env.OTP_MAX_PAR_HEURE, 300);
}

/** Plafond global de créations de compte par heure (INSCRIPTIONS_MAX_PAR_HEURE, 100 par défaut). */
export async function plafondInscriptionsAtteint() {
  const depuis = new Date(Date.now() - HEURE);
  const [comptes, attente] = await Promise.all([
    db.utilisateur.count({ where: { creeLe: { gte: depuis } } }),
    db.inscriptionEnAttente.count({ where: { creeLe: { gte: depuis } } }),
  ]);
  return comptes + attente >= entier(process.env.INSCRIPTIONS_MAX_PAR_HEURE, 100);
}

/**
 * Ménage périodique (appelé par le cron) : supprime ce qui ne sert plus et garde la base légère et à jour
 * (échecs de connexion, codes expirés, sessions échues, inscriptions abandonnées, aperçus d'import, traces de codes).
 */
export async function purgerDonneesPeriodiques(maintenant = new Date()) {
  const il = (jours: number) => new Date(maintenant.getTime() - jours * 86_400_000);
  const [tentatives, codes, sessions, inscriptions, apercus, traces] = await Promise.all([
    db.tentativeConnexion.deleteMany({ where: { creeLe: { lt: il(1) } } }),
    db.codeOtp.deleteMany({ where: { expireLe: { lt: il(2) } } }),
    db.sessionUtilisateur.deleteMany({ where: { expireLe: { lt: maintenant } } }),
    db.inscriptionEnAttente.deleteMany({ where: { expireLe: { lt: il(1) } } }),
    db.importApercu.deleteMany({ where: { creeLe: { lt: il(1) } } }),
    db.message.deleteMany({ where: { type: "OTP", creeLe: { lt: il(7) } } }),
  ]);
  return {
    tentatives: tentatives.count, codes: codes.count, sessions: sessions.count,
    inscriptions: inscriptions.count, apercus: apercus.count, traces: traces.count,
  };
}
