import type { TypeBien } from "@prisma/client";
import { norm } from "./csv";
import { N_ } from "./i18n/translate";
import { normaliserCni } from "./fiche";
import { normalizePhone } from "./security";

export type TypeImport = "proprietaires" | "biens";

/** Message d'erreur : modèle français traduit à l'affichage, avec ses variables. */
export type Erreur = { cle: string; vars?: Record<string, string | number> };

export type LigneApercu = { numero: number; resume: string; erreurs: Erreur[]; statut: "ok" | "existe" | "erreur" };

export type ProprietaireImport = {
  nomComplet: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  personneMorale: boolean;
  typePiece: string | null;
  cni: string | null;
  compteContribuable: string | null;
  bp: string | null;
};

export type BienImport = {
  proprietaireNom: string | null;
  designation: string;
  type: TypeBien;
  quartier: string;
  ville: string;
  loyer: number;
  cautionMois: number;
  jour: number;
  locataire: { nom: string; telephone: string; cni: string | null } | null;
  debut: Date | null;
};

type Colonnes = Record<string, string[]>;

const COLONNES_PROPRIETAIRES: Colonnes = {
  nom: ["nom", "nom complet", "proprietaire", "prenom et nom", "raison sociale", "nom du proprietaire"],
  telephone: ["telephone", "tel", "mobile", "whatsapp", "numero", "portable"],
  email: ["email", "e mail", "mail", "courriel"],
  adresse: ["adresse", "domicile", "siege", "siege social", "domicile ou siege social"],
  ville: ["ville"],
  societe: ["societe", "personne morale", "entreprise"],
  typePiece: ["type piece", "type de piece", "piece"],
  cni: ["numero piece", "numero de piece", "cni", "rccm", "n piece", "numero cni"],
  contribuable: ["ninea", "compte contribuable", "contribuable"],
  bp: ["bp", "boite postale"],
};

const COLONNES_BIENS: Colonnes = {
  proprietaire: ["proprietaire", "nom du proprietaire", "bailleur"],
  designation: ["designation", "bien", "libelle", "nom du bien", "reference"],
  type: ["type", "type de bien"],
  quartier: ["quartier", "adresse", "localisation"],
  ville: ["ville"],
  loyer: ["loyer", "loyer mensuel", "montant du loyer"],
  caution: ["caution", "caution mois", "mois de caution", "caution en mois"],
  jour: ["jour", "jour echeance", "jour d echeance", "echeance"],
  locataire: ["locataire", "nom du locataire", "occupant"],
  telLocataire: ["telephone locataire", "tel locataire", "telephone du locataire", "contact locataire"],
  cniLocataire: ["cni locataire", "piece locataire", "numero piece locataire"],
  debut: ["debut", "date de debut", "debut du bail", "date debut", "entree"],
};

export const MODELE_PROPRIETAIRES = {
  entetes: ["Nom", "Téléphone", "E-mail", "Adresse", "Ville", "Société (oui/non)", "Type de pièce", "Numéro de pièce", "NINEA", "BP"],
  exemple: ["Ousmane Ndiaye", "77 123 45 67", "ousmane@exemple.sn", "Rue 10, Médina", "Dakar", "non", "CNI", "1 234 5678 91011", "", ""],
};
export const MODELE_BIENS = {
  entetes: ["Propriétaire", "Désignation", "Type", "Quartier", "Ville", "Loyer", "Caution (mois)", "Jour d'échéance", "Locataire", "Téléphone du locataire", "CNI du locataire", "Début du bail"],
  exemple: ["Ousmane Ndiaye", "Appartement F3 - Ouakam", "Appartement", "Ouakam", "Dakar", "150000", "2", "5", "Awa Diallo", "77 765 43 21", "", "01/10/2026"],
};

/** Index de chaque colonne reconnue, d'après les noms d'en-têtes (accents, casse et ordre indifférents). */
function reperer(entetes: string[], definition: Colonnes) {
  const n = entetes.map(norm);
  const idx: Record<string, number> = {};
  for (const [cle, alias] of Object.entries(definition)) idx[cle] = n.findIndex((e) => alias.includes(e));
  return idx;
}

const cellule = (ligne: string[], i: number) => (i >= 0 ? (ligne[i] ?? "").trim() : "");
const chiffres = (s: string) => Number(s.replace(/\D/g, "")) || 0;
const oui = (s: string) => ["oui", "o", "yes", "y", "1", "vrai", "true", "x"].includes(norm(s));

/** « 15/10/2026 », « 15-10-2026 » ou « 2026-10-15 » -> date UTC, sinon null. */
export function lireDate(s: string): Date | null {
  const t = s.trim();
  let j: number, m: number, a: number;
  let r = /^(\d{1,2})[/.\- ](\d{1,2})[/.\- ](\d{4})$/.exec(t);
  if (r) [j, m, a] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{4})-(\d{2})-(\d{2})/.exec(t))) [a, m, j] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else return null;
  const d = new Date(Date.UTC(a, m - 1, j));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j && a >= 2000 && a <= 2100 ? d : null;
}

/** Type de bien d'après un libellé libre ; vide = appartement ; inconnu = null. */
export function lireType(s: string): TypeBien | null {
  const n = norm(s);
  if (!n) return "APPARTEMENT";
  if (/appart|f\d|t\d|duplex/.test(n)) return "APPARTEMENT";
  if (/villa|maison/.test(n)) return "VILLA";
  if (/studio|chambre/.test(n)) return "STUDIO";
  if (/commerc|boutique|local|bureau|magasin/.test(n)) return "COMMERCIAL";
  return null;
}

export type AnalyseProprietaires = { lignes: LigneApercu[]; valides: ProprietaireImport[]; manquantes: string[] };
export type AnalyseBiens = { lignes: LigneApercu[]; valides: BienImport[]; manquantes: string[] };

const TYPES_PIECE: Record<string, string> = { cni: "CNI", "carte nationale": "CNI", passeport: "PASSEPORT", rccm: "RCCM", autre: "AUTRE" };

/** Valide un fichier de propriétaires. `existants` : noms (normalisés) et téléphones déjà enregistrés. */
export function analyserProprietaires(lignes: string[][], existants: { noms: Set<string>; telephones: Set<string> }): AnalyseProprietaires {
  const [entetes = [], ...corps] = lignes;
  const c = reperer(entetes, COLONNES_PROPRIETAIRES);
  const manquantes = c.nom < 0 ? [N_("Nom")] : [];
  const vus = { noms: new Set(existants.noms), telephones: new Set(existants.telephones) };
  const apercu: LigneApercu[] = [];
  const valides: ProprietaireImport[] = [];
  if (manquantes.length) return { lignes: apercu, valides, manquantes };

  corps.forEach((l, i) => {
    const numero = i + 2;
    const erreurs: Erreur[] = [];
    const nom = cellule(l, c.nom).replace(/\s+/g, " ");
    const telBrut = cellule(l, c.telephone);
    const telephone = telBrut ? normalizePhone(telBrut) : null;
    const email = cellule(l, c.email);
    if (nom.length < 3) erreurs.push({ cle: N_("Nom trop court (3 caractères minimum).") });
    if (telBrut && !telephone) erreurs.push({ cle: N_("Téléphone invalide : {valeur}.") , vars: { valeur: telBrut } });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erreurs.push({ cle: N_("E-mail invalide : {valeur}."), vars: { valeur: email } });
    const typeBrut = norm(cellule(l, c.typePiece));
    const typePiece = typeBrut ? (Object.entries(TYPES_PIECE).find(([k]) => typeBrut.includes(k))?.[1] ?? null) : null;
    if (typeBrut && !typePiece) erreurs.push({ cle: N_("Type de pièce inconnu : {valeur}."), vars: { valeur: cellule(l, c.typePiece) } });

    const cle = norm(nom);
    const doublon = !erreurs.length && (vus.noms.has(cle) || (telephone !== null && vus.telephones.has(telephone)));
    if (!erreurs.length && !doublon) {
      vus.noms.add(cle);
      if (telephone) vus.telephones.add(telephone);
      valides.push({
        nomComplet: nom,
        telephone,
        email: email || null,
        adresse: cellule(l, c.adresse) || null,
        ville: cellule(l, c.ville) || null,
        personneMorale: oui(cellule(l, c.societe)) || typePiece === "RCCM",
        typePiece,
        cni: cellule(l, c.cni) || null,
        compteContribuable: cellule(l, c.contribuable) || null,
        bp: cellule(l, c.bp) || null,
      });
    }
    apercu.push({ numero, resume: [nom, telBrut].filter(Boolean).join(" · "), erreurs, statut: erreurs.length ? "erreur" : doublon ? "existe" : "ok" });
  });
  return { lignes: apercu, valides, manquantes };
}

/**
 * Valide un fichier de biens (avec locataire et bail facultatifs).
 * `proprietaires` : nom normalisé -> présent ; `existants` : « désignation|quartier » déjà en base ;
 * `capacite` : nombre de biens que le forfait permet encore d'ajouter.
 */
export function analyserBiens(
  lignes: string[][],
  ctx: { proprietaires: Set<string>; existants: Set<string>; capacite: number },
  aujourdhui = new Date(),
): AnalyseBiens {
  const [entetes = [], ...corps] = lignes;
  const c = reperer(entetes, COLONNES_BIENS);
  const manquantes = c.designation < 0 ? [N_("Désignation")] : [];
  const apercu: LigneApercu[] = [];
  const valides: BienImport[] = [];
  if (manquantes.length) return { lignes: apercu, valides, manquantes };
  const vus = new Set(ctx.existants);
  let places = ctx.capacite;

  corps.forEach((l, i) => {
    const numero = i + 2;
    const erreurs: Erreur[] = [];
    const designation = cellule(l, c.designation).replace(/\s+/g, " ");
    const quartier = cellule(l, c.quartier);
    const ville = cellule(l, c.ville) || "Dakar";
    const loyer = chiffres(cellule(l, c.loyer));
    const type = lireType(cellule(l, c.type));
    const propNom = cellule(l, c.proprietaire);
    const locNom = cellule(l, c.locataire).replace(/\s+/g, " ");
    const telBrut = cellule(l, c.telLocataire);
    const debutBrut = cellule(l, c.debut);

    if (designation.length < 2) erreurs.push({ cle: N_("Désignation manquante.") });
    if (!quartier) erreurs.push({ cle: N_("Quartier manquant.") });
    if (!type) erreurs.push({ cle: N_("Type de bien inconnu : {valeur}."), vars: { valeur: cellule(l, c.type) } });
    // Le loyer n'est exigé que pour un bien loué : un bien vacant reçoit son loyer à l'arrivée du locataire.
    if ((locNom || telBrut) && loyer <= 0) erreurs.push({ cle: N_("Loyer manquant ou invalide.") });
    if (propNom && !ctx.proprietaires.has(norm(propNom))) erreurs.push({ cle: N_("Propriétaire inconnu : {valeur}. Importez d'abord les propriétaires."), vars: { valeur: propNom } });
    let locataire: BienImport["locataire"] = null;
    if (locNom || telBrut) {
      const telephone = telBrut ? normalizePhone(telBrut) : null;
      if (locNom.length < 3) erreurs.push({ cle: N_("Nom du locataire manquant ou trop court.") });
      if (!telephone) erreurs.push({ cle: N_("Téléphone du locataire manquant ou invalide.") });
      if (locNom.length >= 3 && telephone) locataire = { nom: locNom, telephone, cni: normaliserCni(cellule(l, c.cniLocataire)) ? cellule(l, c.cniLocataire) : null };
    }
    const debut = debutBrut ? lireDate(debutBrut) : null;
    if (debutBrut && !debut) erreurs.push({ cle: N_("Date de début invalide : {valeur} (jj/mm/aaaa)."), vars: { valeur: debutBrut } });
    const jour = chiffres(cellule(l, c.jour));
    if (cellule(l, c.jour) && (jour < 1 || jour > 28)) erreurs.push({ cle: N_("Jour d'échéance invalide (de 1 à 28).") });

    const cle = `${norm(designation)}|${norm(quartier)}`;
    const doublon = !erreurs.length && vus.has(cle);
    if (!erreurs.length && !doublon) {
      if (places <= 0) erreurs.push({ cle: N_("Limite de logements du forfait atteinte.") });
      else {
        places--;
        vus.add(cle);
        valides.push({
          proprietaireNom: propNom || null,
          designation,
          type: type!,
          quartier,
          ville,
          loyer,
          cautionMois: cellule(l, c.caution) ? Math.min(chiffres(cellule(l, c.caution)), 12) : 2,
          jour: jour >= 1 && jour <= 28 ? jour : 5,
          locataire,
          debut: locataire ? (debut ?? new Date(Date.UTC(aujourdhui.getUTCFullYear(), aujourdhui.getUTCMonth(), aujourdhui.getUTCDate()))) : null,
        });
      }
    }
    apercu.push({
      numero,
      resume: [designation, loyer ? `${loyer} FCFA` : "", locNom].filter(Boolean).join(" · "),
      erreurs,
      statut: erreurs.length ? "erreur" : doublon ? "existe" : "ok",
    });
  });
  return { lignes: apercu, valides, manquantes };
}
