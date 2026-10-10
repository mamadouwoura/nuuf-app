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
