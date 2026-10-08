import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PHOTOS = 8;
export const MAX_OCTETS = 5 * 1024 * 1024;

/** Dossier des fichiers envoyés (volume Docker en production). */
export const dossierPhotos = () => path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads", "photos");

/** Le type est déterminé par le contenu du fichier, jamais par le nom ou le type annoncé par le navigateur. */
export function typeImage(o: Uint8Array): { type: "image/jpeg" | "image/png" | "image/webp"; ext: string } | null {
  if (o.length > 12 && o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (o.length > 12 && o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47) return { type: "image/png", ext: "png" };
  if (o.length > 12 && String.fromCharCode(...o.slice(0, 4)) === "RIFF" && String.fromCharCode(...o.slice(8, 12)) === "WEBP") {
    return { type: "image/webp", ext: "webp" };
  }
  return null;
}

export async function enregistrerFichier(contenu: Uint8Array, ext: string) {
  const nom = `${randomBytes(16).toString("hex")}.${ext}`;
  await mkdir(dossierPhotos(), { recursive: true });
  await writeFile(path.join(dossierPhotos(), nom), contenu, { flag: "wx" });
  return nom;
}

export async function lireFichier(nom: string) {
  // Les noms sont générés par nous ; on refuse tout ce qui ressemble à un chemin.
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(nom)) return null;
  try {
    return await readFile(path.join(dossierPhotos(), nom));
  } catch {
    return null;
  }
}

export async function supprimerFichier(nom: string) {
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(nom)) return;
  await unlink(path.join(dossierPhotos(), nom)).catch(() => {});
}
