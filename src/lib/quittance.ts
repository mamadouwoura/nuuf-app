import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { db } from "./db";

export const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
export const urlVerification = (jeton: string) => `${appUrl()}/verifier/${jeton}`;

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement bancaire" } as const;
/** Police standard PDF = WinAnsi : tout caractère hors de ce jeu est remplacé par « ? » au lieu de faire échouer le PDF. */
const sur = (t: string, police: { encodeText(t: string): unknown }) =>
  Array.from(t.normalize("NFC").replace(/[  ]/g, " "))
    .map((c) => {
      try {
        police.encodeText(c);
        return c;
      } catch {
        return "?";
      }
    })
    .join("");
const nombre = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export async function chargerQuittance(id: string, organisationId?: string) {
  return db.quittance.findFirst({
    where: { id, ...(organisationId ? { organisationId } : {}) },
    include: {
      paiement: { include: { echeance: { include: { bail: { include: { locataire: true, bien: { include: { organisation: true } } } } } } } },
    },
  });
}

type QuittanceComplete = NonNullable<Awaited<ReturnType<typeof chargerQuittance>>>;

export async function genererPdf(q: QuittanceComplete): Promise<Uint8Array> {
  const p = q.paiement;
  const e = p.echeance;
  const bail = e.bail;
  const vert = rgb(0.059, 0.369, 0.294);
  const gris = rgb(0.25, 0.29, 0.27);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold);
  const texte = (t: string, x: number, y: number, o: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(sur(t, o.bold ? gras : normal), { x, y, size: o.size ?? 11, font: o.bold ? gras : normal, color: o.color ?? rgb(0.07, 0.12, 0.09) });

  page.drawRectangle({ x: 0, y: 762, width: 595, height: 80, color: vert });
  texte("nuuf", 40, 795, { size: 26, bold: true, color: rgb(1, 1, 1) });
  texte("Quittance de loyer", 380, 800, { size: 16, bold: true, color: rgb(1, 1, 1) });
  texte(`N° ${q.numero}`, 380, 780, { size: 11, color: rgb(1, 1, 1) });

  const complet = e.statut === "PAYEE";
  texte(complet ? "ACQUITTÉE" : "ACOMPTE", 40, 725, { size: 20, bold: true, color: complet ? vert : rgb(0.85, 0.56, 0.02) });
  texte(`Émise le ${q.emiseLe.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`, 40, 705, { size: 10, color: gris });

  let y = 660;
  const bloc = (titre: string, lignes: string[]) => {
    texte(titre.toUpperCase(), 40, y, { size: 9, bold: true, color: gris });
    y -= 18;
    for (const l of lignes) {
      texte(l, 40, y);
      y -= 16;
    }
    y -= 14;
  };
  bloc("Bailleur", [bail.bien.organisation.nom]);
  bloc("Locataire", [bail.locataire.nomComplet, bail.locataire.telephone]);
  bloc("Logement loué", [bail.bien.designation, `${bail.bien.quartier}, ${bail.bien.ville}`]);
  bloc("Période locative", [`Loyer de ${MOIS[e.mois.getUTCMonth()]} ${e.mois.getUTCFullYear()}`]);

  page.drawRectangle({ x: 40, y: y - 90, width: 515, height: 100, color: rgb(0.94, 0.99, 0.95) });
  texte("Loyer mensuel dû", 56, y - 12, { color: gris });
  texte(`${nombre(e.montantDu)} FCFA`, 400, y - 12, { bold: true });
  texte("Montant versé", 56, y - 38, { bold: true });
  texte(`${nombre(p.montant)} FCFA`, 400, y - 38, { size: 16, bold: true, color: vert });
  texte(`Mode de paiement : ${CANAL[p.canal]}`, 56, y - 62, { size: 10, color: gris });
  texte(`Reçu le ${(p.recuLe ?? p.creeLe).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`, 56, y - 78, { size: 10, color: gris });
  y -= 130;

  texte("Quittance émise via Nuuf, numérotée et vérifiable en ligne grâce au QR code ci-dessous.", 40, y, { size: 9, color: gris });

  const qr = await QRCode.toBuffer(urlVerification(q.jetonQr), { margin: 1, width: 240 });
  const img = await pdf.embedPng(qr);
  page.drawImage(img, { x: 440, y: 60, width: 110, height: 110 });
  texte("Vérifier l'authenticité", 440, 46, { size: 9, bold: true, color: gris });
  texte("Scannez le code ou ouvrez :", 40, 120, { size: 9, color: gris });
  texte(urlVerification(q.jetonQr), 40, 106, { size: 8, color: vert });
  texte("Document généré par Nuuf — gestion locative au Sénégal", 40, 40, { size: 8, color: gris });

  return pdf.save();
}
