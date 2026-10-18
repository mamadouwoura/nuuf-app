import { VERT, GRIS, dateFr, nombre, nouveauDocument } from "./pdf-outils";
import { chargerIdentite } from "./identite";
import { TYPE_LIBELLE } from "./immo";
import type { chargerBail } from "./contrat";

type Bail = NonNullable<Awaited<ReturnType<typeof chargerBail>>>;
type AvenantPdf = {
  numero: number;
  type: string;
  effetLe: Date;
  ancienLoyer: number | null;
  nouveauLoyer: number | null;
  ancienneFinLe: Date | null;
  nouvelleFinLe: Date | null;
  clause: string | null;
  creeLe: Date;
};

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const moisAnnee = (d: Date) => `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

/** Avenant au contrat de location : rappelle le contrat d'origine, énonce la modification, laisse les signatures à la main. */
export async function genererAvenant(bail: Bail, avenant: AvenantPdf, proprietaire: string): Promise<Uint8Array> {
  const d = await nouveauDocument();
  const org = bail.bien.organisation;
  const loc = bail.locataire;
  const bien = bail.bien;
  await d.entete(await chargerIdentite(bail.bien.organisationId));

  d.ligne(`AVENANT N° ${avenant.numero} AU CONTRAT DE LOCATION`, { taille: 18, gras: true, couleur: VERT });
  d.ligne(`${bien.designation} (${TYPE_LIBELLE[bien.type].toLowerCase()})`, { taille: 12 });
  d.espace(8);

  d.article(
    "Entre les soussignés",
    `Le bailleur : ${proprietaire}${org.nom !== proprietaire ? `, agissant pour ${org.nom}` : ""}${org.ninea ? ` (NINEA ${org.ninea})` : ""}, ci-après « le Bailleur ». ` +
      `Le locataire : ${loc.nomComplet}, téléphone ${loc.telephone}${loc.cni ? `, pièce d'identité n° ${loc.cni}` : ""}, ci-après « le Locataire ».`,
  );
  d.article(
    "Rappel",
    `Les parties ont conclu un contrat de location portant sur le bien suivant : ${bien.designation}, situé ${bien.adresse ? `${bien.adresse}, ` : ""}${bien.quartier}, ${bien.ville} (Sénégal), pris à bail à compter du ${dateFr(bail.debutLe)}. Elles conviennent de le modifier comme suit, le présent avenant en faisant partie intégrante.`,
  );

  if (avenant.type === "LOYER" && avenant.ancienLoyer != null && avenant.nouveauLoyer != null) {
    d.article(
      "Article 1 - Modification du loyer",
      `À compter du mois de ${moisAnnee(avenant.effetLe)}, le loyer mensuel est porté de ${nombre(avenant.ancienLoyer)} FCFA à ${nombre(avenant.nouveauLoyer)} FCFA${bail.chargesIncluses ? ", charges comprises" : ", hors charges"}. Il reste payable au plus tard le ${bail.jourEcheance} de chaque mois. Les loyers échus avant cette date demeurent dus au montant antérieur. Le dépôt de garantie n'est pas modifié par le présent avenant.`,
    );
  } else if (avenant.type === "DUREE" && avenant.nouvelleFinLe) {
    d.article(
      "Article 1 - Modification de la durée",
      `${avenant.ancienneFinLe ? `Le contrat devait se terminer le ${dateFr(avenant.ancienneFinLe)}.` : "Le contrat avait été conclu pour une durée indéterminée."} Il est désormais conclu jusqu'au ${dateFr(avenant.nouvelleFinLe)}, sous réserve du préavis écrit d'au moins un mois prévu au contrat d'origine.`,
    );
  } else if (avenant.clause) {
    d.article("Article 1 - Clause convenue entre les parties", avenant.clause);
  }

  d.article("Article 2 - Autres dispositions", "Toutes les autres clauses et conditions du contrat de location d'origine, et des avenants précédents le cas échéant, demeurent inchangées et continuent de produire leurs effets.");

  d.espace(14);
  d.ligne(`Fait à ${bien.ville}, le ${dateFr(avenant.creeLe)}, en deux exemplaires.`);
  d.espace(24);
  await d.signatures({ titre: "Le Bailleur" }, { titre: "Le Locataire" });
  d.ligne("(signatures précédées de « Lu et approuvé »)", { taille: 8.5, couleur: GRIS });
  d.piedDePage("Modèle généré par Nuuf : à faire relire par un professionnel avant usage juridique.");
  return d.sauver();
}
