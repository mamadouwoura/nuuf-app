import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { typeImage } from "./photos";

export const MAX_DOCUMENTS = 8;
export const MAX_OCTETS_DOCUMENT = 6 * 1024 * 1024;

/** Dossier des documents des locataires (volume Docker en production), séparé des photos de biens. */
export const dossierDocuments = () => path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads", "documents");

const NOM_VALIDE = /^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/;

/** Le type est déterminé par le contenu du fichier (image JPEG/PNG/WebP ou PDF), jamais par son nom. */
export function typeDocument(o: Uint8Array): { type: string; ext: string } | null {
  const image = typeImage(o);
  if (image) return image;
  if (o.length > 8 && String.fromCharCode(...o.slice(0, 5)) === "%PDF-") return { type: "application/pdf", ext: "pdf" };
  return null;
}

export async function enregistrerDocument(contenu: Uint8Array, ext: string) {
  const nom = `${randomBytes(16).toString("hex")}.${ext}`;
  await mkdir(dossierDocuments(), { recursive: true });
  await writeFile(path.join(dossierDocuments(), nom), contenu, { flag: "wx" });
  return nom;
}

export async function lireDocument(nom: string) {
  if (!NOM_VALIDE.test(nom)) return null;
  try {
    return await readFile(path.join(dossierDocuments(), nom));
  } catch {
    return null;
  }
}

export async function supprimerDocumentFichier(nom: string) {
  if (!NOM_VALIDE.test(nom)) return;
  await unlink(path.join(dossierDocuments(), nom)).catch(() => {});
}
