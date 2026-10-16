import { VERT, GRIS, dateFr, nombre, nouveauDocument } from "./pdf-outils";
import type { Bilan } from "./bilan";
import type { Identite } from "./identite";

type Mandat = {
  numero: string;
  libelle?: string | null;
  commissionPct: number;
  debutLe: Date;
  dureeMois: number;
  reconduction: boolean;
  jourReversement: number;
  plafondTravaux: number | null;
  preavisMois: number;
  signatureAgence: string | null;
  signatureProprietaire: string | null;
  signeLe: Date | null;
};

type Parties = {
  agence: { nom: string; ninea: string | null; representant: string };
  identite: Identite;
  proprietaire: {
    nomComplet: string;
    telephone: string | null;
    cni: string | null;
    adresse: string | null;
    email?: string | null;
    ville?: string | null;
    personneMorale?: boolean;
    typePiece?: string | null;
    pieceEtablieLe?: Date | null;
    bp?: string | null;
    compteContribuable?: string | null;
  };
  biens: { designation: string; quartier: string; ville: string }[];
};


const TYPE_PIECE: Record<string, string> = { CNI: "carte nationale d'identité", PASSEPORT: "passeport", RCCM: "RCCM", AUTRE: "pièce" };

/** Désignation du propriétaire dans le mandat : particulier ou société, pièce, coordonnées et références fiscales. */
function decrireProprietaire(p: Parties["proprietaire"]) {
  const piece = p.cni
    ? `, ${p.typePiece ? TYPE_PIECE[p.typePiece] ?? "pièce" : p.personneMorale ? "RCCM" : "pièce d'identité"} n° ${p.cni}${p.pieceEtablieLe ? ` établie le ${dateFr(p.pieceEtablieLe)}` : ""}`
    : "";
  const lieu = [p.adresse, p.ville].filter(Boolean).join(", ");
  return (
    `${p.personneMorale ? "la société " : ""}${p.nomComplet}${piece}` +
    (p.compteContribuable ? `, compte contribuable ${p.compteContribuable}` : "") +
    (lieu ? `, ${p.personneMorale ? "dont le siège est à" : "domicilié(e) à"} ${lieu}` : "") +
    (p.bp ? `, ${/^b.?s?p/i.test(p.bp) ? p.bp : `BP ${p.bp}`}` : "") +
    (p.telephone ? `, téléphone ${p.telephone}` : "") +
    (p.email ? `, e-mail ${p.email}` : "")
  );
}

const pct = (p: number) => `${String(p).replace(".", ",")} %`;

/** Contrat de mandat de gestion locative (modèle simple, à faire relire avant usage juridique). */
export async function genererMandat(m: Mandat, p: Parties): Promise<Uint8Array> {
  const d = await nouveauDocument();
  await d.entete(p.identite);
  d.ligne("MANDAT DE GESTION LOCATIVE", { taille: 20, gras: true, couleur: VERT });
  d.ligne(`N° ${m.numero}${m.libelle ? ` - ${m.libelle}` : ""}`, { taille: 12 });
  d.espace(8);

  d.article(
    "Entre les soussignés",
    `L'agence : ${p.agence.nom}${p.agence.ninea ? ` (NINEA ${p.agence.ninea})` : ""}, représentée par ${p.agence.representant}, ci-après « l'Agence ». ` +
      `Le propriétaire : ${decrireProprietaire(p.proprietaire)}, ci-après « le Propriétaire ».`,
  );
  d.article(
    "Article 1 - Objet",
    `Le Propriétaire confie à l'Agence, qui l'accepte, la gestion locative des biens suivants : ${
      p.biens.length ? p.biens.map((b) => `${b.designation} (${b.quartier}, ${b.ville})`).join(" ; ") : "biens à désigner par avenant"
    }. D'autres biens pourront être ajoutés par avenant écrit.`,
  );
  d.article(
    "Article 2 - Pouvoirs de l'Agence",
    `L'Agence est autorisée à : rechercher des locataires et conclure les contrats de location en son nom pour le compte du Propriétaire ; encaisser les loyers et charges ; délivrer les quittances ; relancer les loyers impayés ; établir les états des lieux ; assurer l'entretien courant. ` +
      `Les travaux jusqu'à ${m.plafondTravaux ? `${nombre(m.plafondTravaux)} FCFA` : "un montant fixé d'un commun accord"} par intervention peuvent être engagés sans accord préalable ; au-delà, l'accord écrit du Propriétaire est requis.`,
  );
  d.article(
    "Article 3 - Obligations de l'Agence",
    `L'Agence tient une comptabilité distincte pour chaque propriétaire, remet au Propriétaire un compte rendu de gestion chaque mois, et lui reverse les sommes encaissées, déduction faite de sa rémunération et des dépenses convenues, au plus tard le ${m.jourReversement} du mois suivant.`,
  );
  d.article(
    "Article 4 - Obligations du Propriétaire",
    "Le Propriétaire remet à l'Agence les titres et documents nécessaires, l'informe de toute situation susceptible d'affecter les biens, s'interdit de traiter directement avec les locataires sur les loyers pendant la durée du mandat, et met à disposition les sommes nécessaires aux travaux qu'il a approuvés.",
  );
  d.article(
    "Article 5 - Rémunération",
    `L'Agence perçoit une commission de ${pct(m.commissionPct)} du montant des loyers effectivement encaissés. Aucune commission n'est due sur les loyers non encaissés.`,
  );
  d.article(
    "Article 6 - Durée",
    `Le présent mandat prend effet le ${dateFr(m.debutLe)} pour une durée de ${m.dureeMois} mois${m.reconduction ? ", renouvelable par tacite reconduction pour des périodes de même durée" : ""}.`,
  );
  d.article(
    "Article 7 - Résiliation",
    `Chaque partie peut mettre fin au mandat moyennant un préavis écrit de ${m.preavisMois} mois, notifié par lettre recommandée ou remise contre décharge. À la fin du mandat, l'Agence rend ses comptes et reverse les sommes détenues pour le compte du Propriétaire dans un délai raisonnable.`,
  );
  d.article(
    "Article 8 - Données personnelles",
    "Les parties s'engagent à respecter la loi sénégalaise sur la protection des données à caractère personnel. Les informations relatives aux locataires (identité, paiements) sont traitées pour les seuls besoins de la gestion et de l'historique locatif, avec leur consentement.",
  );
  d.article("Article 9 - Droit applicable", "Le présent mandat est soumis au droit sénégalais. Les parties recherchent un règlement amiable avant toute action devant les tribunaux compétents.");

  d.espace(12);
  d.ligne(`Fait le ${dateFr(m.signeLe ?? new Date())}, en deux exemplaires.`);
  d.espace(18);
  await d.signatures(
    { titre: "L'Agence", image: m.signatureAgence, note: m.signatureAgence && m.signeLe ? `Signé à l'écran le ${dateFr(m.signeLe)}` : undefined },
    { titre: "Le Propriétaire", image: m.signatureProprietaire, note: m.signatureProprietaire && m.signeLe ? `Signé à l'écran le ${dateFr(m.signeLe)}` : undefined },
  );
  d.ligne("(signatures précédées de « Lu et approuvé »)", { taille: 8.5, couleur: GRIS });
  d.piedDePage("Modèle généré par Nuuf : à faire relire par un professionnel avant usage juridique.");
  return d.sauver();
}

/** Type partagé avec le bilan pour les en-têtes de document. */
export type { Bilan };
