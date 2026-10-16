/** Lecture de fichiers CSV tels que les produit Excel : séparateur « ; » ou « , », guillemets, BOM, UTF-8 ou Windows-1252. */

export const IMPORT_MAX_OCTETS = 200 * 1024;
export const IMPORT_MAX_LIGNES = 300;

/** Décode un fichier : UTF-8 si valide, sinon Windows-1252 (export Excel français classique). */
export function decoderFichier(octets: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(octets).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(octets);
  }
}

/** Texte sans accents, en minuscules, espaces simples : sert à comparer des en-têtes et des noms. */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Découpe le texte CSV en lignes de cellules (les lignes entièrement vides sont ignorées). */
export function lireCsv(texte: string): string[][] {
  const t = texte.replace(/^﻿/, "");
  const premiere = t.split(/\r?\n/, 1)[0] ?? "";
  const sep = (premiere.match(/;/g)?.length ?? 0) >= (premiere.match(/,/g)?.length ?? 0) && premiere.includes(";") ? ";" : premiere.includes("\t") && !premiere.includes(",") ? "\t" : ",";
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let cellule = "";
  let guillemets = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (guillemets) {
      if (c === '"' && t[i + 1] === '"') {
        cellule += '"';
        i++;
      } else if (c === '"') guillemets = false;
      else cellule += c;
    } else if (c === '"') guillemets = true;
    else if (c === sep) {
      ligne.push(cellule.trim());
      cellule = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      ligne.push(cellule.trim());
      cellule = "";
      if (ligne.some((x) => x !== "")) lignes.push(ligne);
      ligne = [];
    } else cellule += c;
  }
  ligne.push(cellule.trim());
  if (ligne.some((x) => x !== "")) lignes.push(ligne);
  return lignes;
}

/** Cellule protégée contre l'injection de formules quand le fichier est rouvert dans Excel. */
export const celluleCsv = (v: string | number) => {
  const s = String(v);
  const sure = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${sure.replace(/"/g, '""')}"`;
};
