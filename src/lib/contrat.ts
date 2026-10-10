import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "./db";
import { TYPE_LIBELLE } from "./immo";

const nombre = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

/** Police standard PDF = WinAnsi : tout caractère hors de ce jeu devient « ? » plutôt que de faire échouer le PDF. */
const sur = (t: string, police: { encodeText(t: string): unknown }) =>
  Array.from(t.normalize("NFC").replace(/[  ]/g, " "))
    .map((c) => {
      try {
        police.encodeText(c);
        return c;
      } catch {
        return "?";
      }
    })
    .join("");

export async function chargerBail(bienId: string, organisationId: string) {
  return db.bail.findFirst({
    where: { bienId, actif: true, bien: { organisationId, archiveLe: null } },
    include: { locataire: true, bien: { include: { organisation: true } } },
  });
}

type Bail = NonNullable<Awaited<ReturnType<typeof chargerBail>>>;

/** Contrat de location d'habitation (modèle simple, à faire relire avant usage juridique). */
export async function genererContrat(bail: Bail, proprietaire: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold);
  const vert = rgb(0.059, 0.369, 0.294);
  const encre = rgb(0.07, 0.12, 0.09);
  const L = 595;
  const H = 842;
  const marge = 50;
  let page = pdf.addPage([L, H]);
  let y = H - 60;

  const nouvellePage = () => {
    page = pdf.addPage([L, H]);
    y = H - 60;
  };
  const ligne = (t: string, o: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; x?: number } = {}) => {
    if (y < 70) nouvellePage();
    const font = o.bold ? gras : normal;
    page.drawText(sur(t, font), { x: o.x ?? marge, y, size: o.size ?? 10.5, font, color: o.color ?? encre });
    y -= (o.size ?? 10.5) + 5;
  };
  const paragraphe = (t: string) => {
    const mots = sur(t, normal).split(" ");
    let courant = "";
    for (const m of mots) {
      const essai = courant ? `${courant} ${m}` : m;
      if (normal.widthOfTextAtSize(essai, 10.5) > L - 2 * marge) {
        ligne(courant);
        courant = m;
      } else courant = essai;
    }
    if (courant) ligne(courant);
    y -= 3;
  };
  const article = (titre: string, texte: string) => {
    y -= 4;
    ligne(titre, { bold: true, color: vert });
    paragraphe(texte);
  };

  const org = bail.bien.organisation;
  const loc = bail.locataire;
  const bien = bail.bien;
  const caution = bail.loyerMensuel * bail.cautionMois;

  ligne("CONTRAT DE LOCATION", { size: 20, bold: true, color: vert });
  ligne(`${bien.designation} (${TYPE_LIBELLE[bien.type].toLowerCase()})`, { size: 12 });
  y -= 8;

  article(
    "Entre les soussignés",
    `Le bailleur : ${proprietaire}${org.nom !== proprietaire ? `, agissant pour ${org.nom}` : ""}${org.ninea ? ` (NINEA ${org.ninea})` : ""}, ci-après « le Bailleur ». ` +
      `Le locataire : ${loc.nomComplet}${loc.dateNaissance ? `, né(e) le ${dateFr(loc.dateNaissance)}${loc.lieuNaissance ? ` à ${loc.lieuNaissance}` : ""}` : ""}${loc.dernierDomicile ? `, domicilié(e) à ${loc.dernierDomicile}` : ""}, téléphone ${loc.telephone}${loc.cni ? `, pièce d'identité n° ${loc.cni}` : ""}${loc.profession ? `, profession : ${loc.profession}` : ""}, ci-après « le Locataire ».`,
  );
  article(
    "Article 1 - Objet",
    `Le Bailleur donne en location au Locataire, qui l'accepte, le bien suivant : ${bien.designation}, situé ${bien.adresse ? `${bien.adresse}, ` : ""}${bien.quartier}, ${bien.ville} (Sénégal)${bien.surfaceM2 ? `, d'une surface de ${bien.surfaceM2} m²` : ""}. Le Bailleur s'engage à livrer les clés du bien conformes à sa destination dès la signature du contrat. Le bien est destiné à l'usage convenu entre les parties : le Locataire ne peut en changer la destination, ni le céder ou le sous-louer, en tout ou partie, sans l'autorisation formelle et écrite du Bailleur ou de son mandataire.`,
  );
  article(
    "Article 2 - Durée",
    `Le présent contrat prend effet le ${dateFr(bail.debutLe)}${bail.finLe ? ` et se termine le ${dateFr(bail.finLe)}` : " pour une durée indéterminée"}. Chaque partie peut y mettre fin moyennant un préavis écrit d'au moins un mois, notifié par lettre recommandée ou remise contre décharge. Le jour de l'expiration du contrat, le Locataire remet les clés du bien au Bailleur ou à son mandataire.`,
  );
  article(
    "Article 3 - Loyer et charges",
    `Le loyer mensuel est fixé à ${nombre(bail.loyerMensuel)} FCFA${bail.chargesIncluses ? ", charges comprises" : ", hors charges"}. Il est payable au plus tard le ${bail.jourEcheance} de chaque mois, par Wave, Orange Money, espèces ou virement. Le Locataire acquitte, avec le Bailleur, la taxe d'enlèvement des ordures ménagères et prend en charge ses consommations d'eau et d'électricité. Chaque paiement donne lieu à une quittance numérotée, vérifiable par QR code.`,
  );
  article(
    "Article 4 - Dépôt de garantie",
    `Le Locataire verse un dépôt de garantie de ${nombre(caution)} FCFA (${bail.cautionMois} mois de loyer), restitué à la sortie après état des lieux, déduction faite des sommes dues et des réparations locatives éventuelles. Il est destiné à couvrir d'éventuels impayés de loyer ou de charges, ou des dégradations constatées lors de l'état des lieux de sortie.`,
  );
  article(
    "Article 5 - Obligations du Locataire",
    "Le Locataire paie le loyer aux échéances convenues, use paisiblement du bien, l'entretient en bon père de famille, répond des dégradations survenues pendant la location, et le restitue en fin de bail tel qu'il l'a reçu. Les améliorations ou embellissements qu'il y apporte restent au Bailleur sans indemnité, sauf rétablissement des lieux à la demande de celui-ci ; il ne réalise aucune construction ni démolition sans l'accord exprès et écrit du Bailleur. Il satisfait aux charges de balayage, d'éclairage et autres charges de ville ou de police auxquelles les locataires sont tenus.",
  );
  article(
    "Article 6 - Obligations du Bailleur",
    "Le Bailleur remet au Locataire un bien en bon état d'usage, en assure la jouissance paisible et n'est tenu, en cours de bail, que des grosses réparations qui deviendraient nécessaires. Un état des lieux d'entrée et un état des lieux de sortie sont établis contradictoirement.",
  );
  article(
    "Article 7 - Résiliation",
    "En cas de non-paiement du loyer ou de manquement grave aux obligations du contrat, le Bailleur peut résilier le contrat après mise en demeure restée sans effet pendant un délai raisonnable, conformément à la loi sénégalaise.",
  );
  article(
    "Article 8 - Historique locatif et données personnelles",
    "Le Locataire est informé que les informations relatives à l'exécution du présent contrat (dates et régularité des paiements, durée de l'occupation, fin du bail) sont enregistrées dans la plateforme Nuuf. Il accepte qu'elles puissent être consultées par les agences et bailleurs utilisant Nuuf auxquels il présente une candidature à la location, aux seules fins d'apprécier cette candidature. Il dispose d'un droit d'accès, de rectification, d'opposition et d'effacement de ses données, conformément à la loi sénégalaise sur la protection des données à caractère personnel.",
  );
  article("Article 9 - Droit applicable", "Le présent contrat est soumis au droit sénégalais. Les parties recherchent un règlement amiable avant toute action devant les tribunaux compétents.");

  y -= 14;
  ligne(`Fait à ${bien.ville}, le ${dateFr(new Date())}, en deux exemplaires.`);
  y -= 30;
  if (y < 130) nouvellePage();
  ligne("Le Bailleur", { bold: true });
  page.drawText(sur("Le Locataire", gras), { x: 360, y: y + 15.5, size: 10.5, font: gras, color: encre });
  if (loc.signature?.startsWith("data:image/png;base64,")) {
    try {
      const img = await pdf.embedPng(Buffer.from(loc.signature.split(",")[1], "base64"));
      const echelle = Math.min(150 / img.width, 55 / img.height);
      page.drawImage(img, { x: 360, y: y - 50, width: img.width * echelle, height: img.height * echelle });
      if (loc.signeLe) page.drawText(sur(`Signé à l'écran le ${dateFr(loc.signeLe)}`, normal), { x: 360, y: y - 62, size: 7.5, font: normal, color: rgb(0.4, 0.44, 0.42) });
    } catch {
      /* signature illisible : le contrat reste imprimable et signable à la main */
    }
  }
  y -= 40;
  ligne("(signature précédée de « Lu et approuvé »)", { size: 8.5, color: rgb(0.4, 0.44, 0.42) });
  page.drawText(sur("Modèle généré par Nuuf : à faire relire par un professionnel avant usage juridique.", normal), {
    x: marge, y: 30, size: 8.5, font: normal, color: rgb(0.4, 0.44, 0.42),
  });

  return pdf.save();
}
