import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * La police d'icônes (public/fonts/material-symbols-v2.woff2) ne contient que les icônes listées dans
 * scripts/icones-utilisees.txt. Une icône absente s'afficherait comme du texte brut : ce test l'empêche.
 */
const autorisees = new Set(readFileSync("scripts/icones-utilisees.txt", "utf8").split(/\r?\n/).filter(Boolean));

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = path.join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : /\.tsx$/.test(nom) ? [chemin] : [];
  });
}

describe("police d'icônes", () => {
  it("contient toutes les icônes écrites en clair dans les composants", () => {
    const absentes = new Map<string, string>();
    for (const f of fichiers("src")) {
      const s = readFileSync(f, "utf8");
      for (const m of s.matchAll(/material-symbols-outlined[^>]*>\s*([a-z][a-z0-9_]+)\s*</g)) {
        if (!autorisees.has(m[1])) absentes.set(m[1], f);
      }
    }
    expect([...absentes].map(([n, f]) => `${n} (${f})`)).toEqual([]);
  });

  it("ne garde que des noms d'icônes bien formés", () => {
    for (const nom of autorisees) expect(nom).toMatch(/^[a-z][a-z0-9_]+$/);
  });
});
