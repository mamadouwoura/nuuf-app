import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Identite } from "./identite";

export const VERT = rgb(0.059, 0.369, 0.294);
export const ENCRE = rgb(0.07, 0.12, 0.09);
export const GRIS = rgb(0.4, 0.44, 0.42);
export const FOND = rgb(0.953, 0.973, 0.961);

/** Police standard PDF = WinAnsi : tout caractère hors de ce jeu devient « ? » plutôt que de faire échouer le PDF. */
export function sur(t: string, police: { encodeText(t: string): unknown }) {
  return Array.from(t.normalize("NFC").replace(/[  ]/g, " "))
    .map((c) => {
      try {
        police.encodeText(c);
        return c;
      } catch {
        return "?";
      }
    })
    .join("");
}

export const nombre = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });

const L = 595;
const H = 842;
const MARGE = 50;

/** Petit outil de mise en page A4 : lignes, paragraphes, tableaux, signatures, sauts de page. */
export async function nouveauDocument() {
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = pdf.addPage([L, H]);
  let y = H - 60;

  const nouvellePage = () => {
    page = pdf.addPage([L, H]);
    y = H - 60;
  };
  const place = (hauteur: number) => {
    if (y - hauteur < 60) nouvellePage();
  };
  const ligne = (t: string, o: { taille?: number; gras?: boolean; couleur?: ReturnType<typeof rgb>; x?: number } = {}) => {
    const taille = o.taille ?? 10.5;
    place(taille + 5);
    const font: PDFFont = o.gras ? gras : normal;
    page.drawText(sur(t, font), { x: o.x ?? MARGE, y, size: taille, font, color: o.couleur ?? ENCRE });
    y -= taille + 5;
  };
  const paragraphe = (t: string, taille = 10.5) => {
    const mots = sur(t, normal).split(" ");
    let courant = "";
    for (const m of mots) {
      const essai = courant ? `${courant} ${m}` : m;
      if (normal.widthOfTextAtSize(essai, taille) > L - 2 * MARGE) {
        ligne(courant, { taille });
        courant = m;
      } else courant = essai;
    }
    if (courant) ligne(courant, { taille });
    y -= 3;
  };
  const article = (titre: string, texte: string) => {
    y -= 4;
    ligne(titre, { gras: true, couleur: VERT });
    paragraphe(texte);
  };
  const espace = (n: number) => {
    y -= n;
  };
  /** En-tête personnalisé (logo, nom, coordonnées) de l'organisation, en haut de la première page. */
  const entete = async (identite: Identite) => {
    y = await dessinerEntete(pdf, page, { normal, gras }, identite, y + 20);
  };

  /** Tableau : `colonnes` = largeurs en points (somme = 495), `droite` = indices alignés à droite. */
  const tableau = (entetes: string[], lignes: string[][], colonnes: number[], droite: number[] = [], pied?: string[]) => {
    const hauteur = 20;
    const dessiner = (cellules: string[], o: { fond?: ReturnType<typeof rgb>; gras?: boolean; couleur?: ReturnType<typeof rgb> }) => {
      place(hauteur + 4);
      if (o.fond) page.drawRectangle({ x: MARGE, y: y - 6, width: L - 2 * MARGE, height: hauteur, color: o.fond });
      let x = MARGE;
      cellules.forEach((c, i) => {
        const font = o.gras ? gras : normal;
        let t = sur(c, font);
        while (t.length > 1 && font.widthOfTextAtSize(t, 9) > colonnes[i] - 8) t = t.slice(0, -2) + "…";
        t = sur(t, font);
        const w = font.widthOfTextAtSize(t, 9);
        const px = droite.includes(i) ? x + colonnes[i] - 4 - w : x + 4;
        page.drawText(t, { x: px, y: y + 1, size: 9, font, color: o.couleur ?? ENCRE });
        x += colonnes[i];
      });
      page.drawLine({ start: { x: MARGE, y: y - 6 }, end: { x: L - MARGE, y: y - 6 }, thickness: 0.5, color: rgb(0.85, 0.9, 0.87) });
      y -= hauteur;
    };
    dessiner(entetes, { fond: VERT, gras: true, couleur: rgb(1, 1, 1) });
    for (const l of lignes) dessiner(l, {});
    if (pied) dessiner(pied, { fond: FOND, gras: true });
    y -= 6;
  };

  const image = async (dataUrl: string | null | undefined): Promise<PDFImage | null> => {
    if (!dataUrl?.startsWith("data:image/png;base64,")) return null;
    try {
      return await pdf.embedPng(Buffer.from(dataUrl.split(",")[1], "base64"));
    } catch {
      return null;
    }
  };

  /** Deux blocs de signature côte à côte (nom du signataire, image facultative, mention de date). */
  const signatures = async (gauche: { titre: string; image?: string | null; note?: string }, droiteBloc: { titre: string; image?: string | null; note?: string }) => {
    place(110);
    const dessiner = async (b: { titre: string; image?: string | null; note?: string }, x: number) => {
      page.drawText(sur(b.titre, gras), { x, y, size: 10.5, font: gras, color: ENCRE });
      const img = await image(b.image);
      if (img) {
        const e = Math.min(170 / img.width, 55 / img.height);
        page.drawImage(img, { x, y: y - 62, width: img.width * e, height: img.height * e });
      }
      if (b.note) page.drawText(sur(b.note, normal), { x, y: y - 74, size: 7.5, font: normal, color: GRIS });
    };
    await dessiner(gauche, MARGE);
    await dessiner(droiteBloc, 330);
    y -= 90;
  };

  const piedDePage = (t: string) => {
    for (const p of pdf.getPages()) p.drawText(sur(t, normal), { x: MARGE, y: 28, size: 8, font: normal, color: GRIS });
  };

  return {
    pdf,
    get y() {
      return y;
    },
    ligne,
    paragraphe,
    article,
    espace,
    entete,
    tableau,
    signatures,
    piedDePage,
    nouvellePage,
    sauver: () => pdf.save(),
  };
}

/**
 * En-tête personnalisé d'un document : logo (s'il existe), nom, coordonnées et NINEA, puis un filet.
 * Dessine à partir de `y` (haut du bloc) et renvoie la nouvelle position verticale.
 */
export async function dessinerEntete(
  pdf: PDFDocument,
  page: PDFPage,
  polices: { normal: PDFFont; gras: PDFFont },
  identite: Identite,
  y: number,
): Promise<number> {
  const { normal, gras } = polices;
  let x = MARGE;
  let hauteurLogo = 0;
  if (identite.logo) {
    try {
      const img = identite.logo.type === "png" ? await pdf.embedPng(identite.logo.octets) : await pdf.embedJpg(identite.logo.octets);
      const e = Math.min(130 / img.width, 54 / img.height);
      hauteurLogo = img.height * e;
      page.drawImage(img, { x, y: y - hauteurLogo, width: img.width * e, height: hauteurLogo });
      x += img.width * e + 14;
    } catch {
      /* image illisible : le document est produit sans logo */
    }
  }
  let yt = y - 12;
  page.drawText(sur(identite.nom, gras), { x, y: yt, size: 13, font: gras, color: ENCRE });
  const coordonnees = [identite.telephone, identite.email].filter(Boolean).join("  -  ");
  const details = [identite.adresse, coordonnees, identite.ninea ? `NINEA ${identite.ninea}` : ""].filter(Boolean) as string[];
  for (const d of details) {
    yt -= 12;
    page.drawText(sur(d, normal), { x, y: yt, size: 8.5, font: normal, color: GRIS });
  }
  const bas = Math.min(y - hauteurLogo, yt) - 8;
  page.drawLine({ start: { x: MARGE, y: bas }, end: { x: L - MARGE, y: bas }, thickness: 1, color: VERT });
  return bas - 22;
}
