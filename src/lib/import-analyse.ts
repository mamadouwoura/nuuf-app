import { db } from "./db";
import { limiteLogements } from "./abonnement";
import { IMPORT_MAX_LIGNES, lireCsv, norm } from "./csv";
import { analyserBiens, analyserProprietaires, type TypeImport } from "./import";
import { N_ } from "./i18n/translate";

/** Valide un fichier d'import contre les données de l'organisation. Module interne : jamais exposé comme action. */
export type Echec = { ok: false; erreur: string; vars?: Record<string, string | number> };
export type Succes = { ok: true; type: TypeImport; analyse: ReturnType<typeof analyserProprietaires> | ReturnType<typeof analyserBiens> };

/** Lit le fichier ou le texte, applique les limites, puis valide chaque ligne contre les données de l'organisation. */
export async function analyserFichier(type: TypeImport, texte: string, organisationId: string, forfait: Parameters<typeof limiteLogements>[0]): Promise<Echec | Succes> {
  const lignes = lireCsv(texte);
  if (lignes.length < 2) return { ok: false, erreur: N_("Le fichier ne contient aucune ligne de données.") } as Echec;
  if (lignes.length - 1 > IMPORT_MAX_LIGNES) return { ok: false, erreur: N_("Le fichier dépasse {max} lignes : découpez-le en plusieurs imports."), vars: { max: IMPORT_MAX_LIGNES } } as Echec;
  if (type === "proprietaires") {
    const exist = await db.proprietaire.findMany({ where: { organisationId }, select: { nomComplet: true, telephone: true } });
    const a = analyserProprietaires(lignes, {
      noms: new Set(exist.map((p) => norm(p.nomComplet))),
      telephones: new Set(exist.flatMap((p) => (p.telephone ? [p.telephone] : []))),
    });
    return { ok: true, analyse: a, type } as Succes;
  }
  const [proprietaires, biens] = await Promise.all([
    db.proprietaire.findMany({ where: { organisationId }, select: { nomComplet: true } }),
    db.bien.findMany({ where: { organisationId, archiveLe: null }, select: { designation: true, quartier: true } }),
  ]);
  const a = analyserBiens(lignes, {
    proprietaires: new Set(proprietaires.map((p) => norm(p.nomComplet))),
    existants: new Set(biens.map((b) => `${norm(b.designation)}|${norm(b.quartier)}`)),
    capacite: Math.max(0, limiteLogements(forfait) - biens.length),
  });
  return { ok: true, analyse: a, type } as Succes;
}


/** Aperçu d'import de cet utilisateur, s'il a moins d'une heure. */
export const apercuRecent = (id: string, utilisateurId: string, organisationId: string) =>
  db.importApercu.findFirst({ where: { id: id.slice(0, 40), utilisateurId, organisationId, creeLe: { gt: new Date(Date.now() - 3_600_000) } } });
