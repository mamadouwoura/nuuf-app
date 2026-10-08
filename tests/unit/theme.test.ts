import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

/** Jetons de couleur définis dans un bloc CSS (nom → valeur). */
const jetons = (bloc: string) => Object.fromEntries([...bloc.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{3,8})/g)].map((m) => [m[1], m[2].toLowerCase()]));
const bloc = (debut: string) => {
  const i = css.indexOf(debut);
  const fin = css.indexOf("\n}", i);
  return css.slice(i, fin);
};

const clair = jetons(bloc("@theme {"));
const sombreManuel = jetons(bloc(':root[data-theme="dark"] {'));
const sombreAuto = jetons(css.slice(css.indexOf("@media (prefers-color-scheme: dark)"), css.indexOf(".palette-claire")));
const palette = jetons(bloc(".palette-claire {"));

const fichiers = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = path.join(d, f);
    return statSync(p).isDirectory() ? fichiers(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
const source = fichiers("src").filter((f) => !/[\\/]ports[\\/](?!Connexion|Inscription|VerificationNumero)/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");

/** Jetons de couleur effectivement utilisés par des classes Tailwind (bg-surface, text-on-primary/80…). */
function jetonsUtilises() {
  const noms = Object.keys(clair).sort((a, b) => b.length - a.length);
  const motif = new RegExp(`(?:bg|text|border|ring|from|to|via|divide|fill|stroke|outline|decoration|accent|caret|shadow)-(${noms.join("|")})(?![\\w-])`, "g");
  return new Set([...source.matchAll(motif)].map((m) => m[1]));
}

describe("mode sombre", () => {
  it("le thème sombre manuel et le thème sombre automatique définissent les mêmes couleurs", () => {
    expect(sombreAuto).toEqual(sombreManuel);
  });
  it("chaque couleur utilisée par l'interface a une version sombre (ou est volontairement identique)", () => {
    // Couleurs de marque ou de texte posé sur une surface de marque : identiques dans les deux thèmes.
    const IDENTIQUES = new Set<string>([]);
    const sansVariante = [...jetonsUtilises()].filter((n) => !(n in sombreManuel) && !IDENTIQUES.has(n));
    expect(sansVariante).toEqual([]);
  });
  it("les couleurs sombres sont différentes des claires (pas de copier-coller)", () => {
    const identiques = Object.entries(sombreManuel).filter(([n, v]) => clair[n] === v).map(([n]) => n);
    expect(identiques).toEqual([]);
  });
  it("la palette claire de secours couvre toutes les couleurs claires", () => {
    expect(Object.keys(palette).sort()).toEqual(Object.keys(clair).sort());
    for (const [n, v] of Object.entries(palette)) expect(v).toBe(clair[n]);
  });
  it("le texte principal est lisible sur les surfaces sombres (contraste ≥ 4,5)", () => {
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    const paires: [string, string][] = [
      ["on-surface", "surface"], ["on-surface", "surface-container"], ["on-surface-variant", "surface"], ["on-surface-variant", "surface-container-high"],
      ["primary", "surface"], ["on-primary", "primary"], ["on-primary", "primary-container"], ["error", "surface"], ["on-error-container", "error-container"],
      ["on-success-container", "success-container"], ["on-action-soft", "action-soft"], ["on-secondary-fixed", "secondary-fixed"], ["on-primary-fixed", "primary-fixed"],
    ];
    for (const [fg, bg] of paires) expect(ratio(sombreManuel[fg], sombreManuel[bg]), `${fg} sur ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
});
