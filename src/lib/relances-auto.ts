import { db } from "./db";
import { etatAcces } from "./abonnement";
import { lienPaiement } from "./encaissement";
import { envoyerMessage, modeMessagerie } from "./messagerie";
import { fcfa } from "./immo";
import { moisAnnee } from "./i18n/format";
import { assurerEcheances, debutMois } from "./loyers";
import { HEURE_PAR_DEFAUT, REGLES_PAR_DEFAUT, declencheurPour, modelePour, regleApplicable, remplirModele, type Variable } from "./relances-regles";

const JOUR = 86_400_000;
/** On ne remonte pas au-delà de 60 jours de retard, et on prépare jusqu'à 30 jours avant l'échéance. */
const RETARD_MAX = 60;
const AVANCE_MAX = 30;

const dateFr = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;

/** Les valeurs qui remplacent {prenom}, {montant}… dans le message d'une relance. */
export function variablesMessage(e: { mois: Date; dateLimite: Date; bail: { locataire: { nomComplet: string }; bien: { designation: string } } }, reste: number, lien: string, jours: number): Record<Variable, string> {
  return {
    prenom: e.bail.locataire.nomComplet.split(" ")[0],
    nom: e.bail.locataire.nomComplet,
    montant: `${fcfa(reste)} FCFA`,
    bien: e.bail.bien.designation,
    mois: moisAnnee(e.mois, "fr"),
    echeance: dateFr(e.dateLimite),
    jours: String(Math.max(0, jours)),
    lien,
  };
}

/**
 * Crée les échéances du mois pour tous les baux actifs, sans attendre que le bailleur ouvre l'application :
 * sans elles, aucun rappel ne partirait pour un bailleur qui ne se connecte pas. Dans les quatre derniers
 * jours du mois, celles du mois suivant sont créées aussi, pour que les rappels « avant échéance » d'un loyer dû le 1er partent.
 */
export async function creerEcheancesDuMois(now = new Date()) {
  const baux = await db.bail.findMany({
    where: { actif: true, bien: { archiveLe: null } },
    select: { bien: { select: { organisationId: true } } },
  });
  const organisations = [...new Set(baux.map((b) => b.bien.organisationId))];
  const ceMois = debutMois(now);
  const dernierJour = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const moisSuivant = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const bientotFinDeMois = dernierJour - now.getUTCDate() <= AVANCE_MAX;
  for (const id of organisations) {
    await assurerEcheances(id, ceMois);
    if (bientotFinDeMois) await assurerEcheances(id, moisSuivant);
  }
  return organisations.length;
}

type Reglages = { regles: number[]; heureEnvoi: number; modeleAvant: string | null; modeleRetard: string | null };

/** Réglages de relance de chaque organisation. Sans réglage enregistré : les trois relances d'origine, à 9 h. */
async function chargerReglages() {
  const [parametres, regles] = await Promise.all([db.parametresRelance.findMany(), db.regleRelance.findMany({ where: { actif: true } })]);
  const parOrg = new Map<string, number[]>();
  for (const r of regles) parOrg.set(r.organisationId, [...(parOrg.get(r.organisationId) ?? []), r.jours]);
  const reglages = new Map<string, Reglages>();
  for (const p of parametres) reglages.set(p.organisationId, { regles: parOrg.get(p.organisationId) ?? [], heureEnvoi: p.heureEnvoi, modeleAvant: p.modeleAvant, modeleRetard: p.modeleRetard });
  const defaut: Reglages = { regles: REGLES_PAR_DEFAUT, heureEnvoi: HEURE_PAR_DEFAUT, modeleAvant: null, modeleRetard: null };
  return (organisationId: string): Reglages => reglages.get(organisationId) ?? defaut;
}

/**
 * Parcourt les loyers impayés et envoie les rappels prévus par les règles de chaque organisation, à partir de l'heure
 * qu'elle a choisie. Idempotent : un même rappel n'est jamais envoyé deux fois pour une échéance. Envoie ensuite les
 * relances programmées dont l'heure est venue.
 */
export async function lancerRelancesAutomatiques(now = new Date()) {
  await creerEcheancesDuMois(now);
  const debutJour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const echeances = await db.echeance.findMany({
    where: {
      statut: { not: "PAYEE" },
      dateLimite: { gte: new Date(debutJour - RETARD_MAX * JOUR), lte: new Date(debutJour + AVANCE_MAX * JOUR) },
    },
    include: {
      paiements: { where: { statut: "CONFIRME" } },
      relances: true,
      bail: { include: { locataire: true, bien: { include: { organisation: { include: { abonnement: true } } } } } },
    },
  });

  const reglagesDe = await chargerReglages();
  let envoyees = 0;
  let ignorees = 0;
  for (const e of echeances) {
    const org = e.bail.bien.organisation;
    if (!e.bail.actif || !etatAcces(org.abonnement, now).ecriture) { ignorees++; continue; }
    const reste = e.montantDu - e.paiements.reduce((s, p) => s + p.montant, 0);
    if (reste <= 0) continue;
    const r = reglagesDe(org.id);
    if (now.getUTCHours() < r.heureEnvoi) continue; // pas encore l'heure choisie par l'organisation
    const jours = Math.round((debutJour - e.dateLimite.getTime()) / JOUR);
    const regle = regleApplicable(jours, r.regles);
    if (regle === null) continue;
    const declencheur = declencheurPour(regle);
    if (e.relances.some((x) => x.declencheur === declencheur)) continue;

    const lien = await lienPaiement(e.id);
    const texte = remplirModele(modelePour(regle, r), variablesMessage(e, reste, lien, jours));
    const parti = await envoyerMessage({ type: "RELANCE", destinataire: e.bail.locataire.telephone, texte, organisationId: org.id });
    // En mode simulation on trace aussi la relance pour que le comportement soit observable ; en mode
    // désactivé ou en échec rien n'est tracé, le rappel sera retenté au prochain passage.
    if (parti || modeMessagerie() === "simulation") {
      await db.relance.create({ data: { echeanceId: e.id, declencheur } });
      envoyees++;
    } else {
      ignorees++;
    }
  }
  const programmees = await envoyerRelancesProgrammees(now, reglagesDe);
  return { examinees: echeances.length, envoyees, ignorees, programmees };
}

/**
 * Envoie les relances programmées à une date précise. Une relance dont le loyer a été payé entre-temps est annulée,
 * jamais envoyée. Un compte en lecture seule ou un envoi échoué est retenté au passage suivant.
 */
export async function envoyerRelancesProgrammees(now = new Date(), reglagesDe?: (organisationId: string) => Reglages) {
  const lire = reglagesDe ?? (await chargerReglages());
  const dues = await db.relanceProgrammee.findMany({
    where: { envoyeeLe: null, annuleeLe: null, envoiLe: { lte: now } },
    include: {
      echeance: {
        include: {
          paiements: { where: { statut: "CONFIRME" } },
          bail: { include: { locataire: true, bien: { include: { organisation: { include: { abonnement: true } } } } } },
        },
      },
    },
    orderBy: { envoiLe: "asc" },
    take: 500,
  });
  const debutJour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let envoyees = 0;
  for (const p of dues) {
    const e = p.echeance;
    const org = e.bail.bien.organisation;
    const reste = e.montantDu - e.paiements.reduce((s, x) => s + x.montant, 0);
    if (reste <= 0 || !e.bail.actif) {
      await db.relanceProgrammee.update({ where: { id: p.id }, data: { annuleeLe: now } });
      continue;
    }
    if (!etatAcces(org.abonnement, now).ecriture) continue;
    const jours = Math.round((debutJour - e.dateLimite.getTime()) / JOUR);
    const lien = await lienPaiement(e.id);
    const texte = remplirModele(modelePour(jours, lire(org.id)), variablesMessage(e, reste, lien, jours));
    const parti = await envoyerMessage({ type: "RELANCE", destinataire: e.bail.locataire.telephone, texte, organisationId: org.id });
    if (parti || modeMessagerie() === "simulation") {
      await db.$transaction([
        db.relance.create({ data: { echeanceId: e.id, declencheur: "programmée" } }),
        db.relanceProgrammee.update({ where: { id: p.id }, data: { envoyeeLe: now } }),
      ]);
      envoyees++;
    }
  }
  return envoyees;
}
