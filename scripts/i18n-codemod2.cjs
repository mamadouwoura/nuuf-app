// Enveloppe les littéraux français du code : t("…") dans les fonctions qui ont t, N_("…") au niveau du module.
// Dans les fichiers « use server », chaque fonction async concernée reçoit `const { t } = await getT();`.
// Usage : node scripts/i18n-codemod2.cjs [--ecrire] [fichiers…]  (sans fichier : tous les fichiers cibles)
const { ts, fs, fichiers, littereauxTexte } = require("./_i18n-lib.cjs");

const ecrire = process.argv.includes("--ecrire");
const choisis = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const cibles = choisis.length ? choisis : fichiers;
// Les routes (réponses techniques) et quelques modules restent hors périmètre ou sont traités à la main.
const SKIP = [/[\\/]route\.ts$/, /[\\/]manifest\.ts$/, /[\\/]app[\\/]layout\.tsx$/, /[\\/]lib[\\/]mot-de-passe\.ts$/, /[\\/]lib[\\/]security\.ts$/, /[\\/]lib[\\/]encaissement\.ts$/, /[\\/]lib[\\/]passerelle\.ts$/, /[\\/]lib[\\/]loyers\.ts$/];

const fonctionRacine = (node) => {
  let n = node, res = null;
  while (n && n.parent) {
    if (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) {
      const p = n.parent;
      if (ts.isSourceFile(p) || ts.isExportAssignment(p) || (ts.isVariableDeclaration(p) && ts.isVariableStatement(p.parent?.parent) && ts.isSourceFile(p.parent.parent.parent))) res = n;
    }
    n = n.parent;
  }
  return res;
};

const ajouterImport = (code, ligneImport) => {
  const lignes = code.split("\n");
  let d = -1;
  lignes.forEach((l, i) => {
    if (/^import .*;\s*$/.test(l) || /^} from ".*";\s*$/.test(l)) d = i;
  });
  lignes.splice(d + 1, 0, ligneImport);
  return lignes.join("\n");
};

const total = { t: 0, N: 0, manuel: 0 };
for (const f of cibles) {
  if (SKIP.some((r) => r.test(f))) continue;
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  const manuel = [];
  const serveurAction = /^\s*["']use server["']/.test(src);
  const fonctionsAvecT = new Map();
  let besoinN = false;
  for (const { node, texte } of littereauxTexte(sf)) {
    const ligne = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    if (ts.isTemplateExpression(node)) { manuel.push([ligne, "gabarit: " + texte.slice(0, 100)]); continue; }
    const brut = node.getText();
    const fn = fonctionRacine(node);
    const attr = ts.isJsxAttribute(node.parent);
    const avecT = fn && fn.body && /=\s*(await getT|useT)\(\)/.test(fn.body.getText());
    const asyncAction = fn && serveurAction && fn.body && ts.isBlock(fn.body) && (fn.modifiers || []).some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
    if (avecT || asyncAction) {
      if (!avecT) fonctionsAvecT.set(fn, fn.body.getStart() + 1);
      edits.push({ start: node.getStart(), end: node.getEnd(), texte: attr ? `{t(${brut})}` : `t(${brut})` });
      total.t++;
    } else if (!fn) {
      edits.push({ start: node.getStart(), end: node.getEnd(), texte: `N_(${brut})` });
      besoinN = true;
      total.N++;
    } else {
      manuel.push([ligne, "fonction sans t: " + texte.slice(0, 100)]);
    }
  }
  total.manuel += manuel.length;
  if (edits.length || manuel.length) console.log(`${f}: ${edits.length} enveloppés, ${manuel.length} manuels`);
  for (const [l, m] of manuel) console.log(`    L${l} ${m}`);
  if (ecrire && edits.length) {
    let out = src;
    for (const pos of fonctionsAvecT.values()) edits.push({ start: pos, end: pos, texte: "\n  const { t } = await getT();" });
    edits.sort((a, b) => b.start - a.start);
    for (const e of edits) out = out.slice(0, e.start) + e.texte + out.slice(e.end);
    if (fonctionsAvecT.size && !/from "@\/lib\/i18n\/server"/.test(out)) out = ajouterImport(out, 'import { getT } from "@/lib/i18n/server";');
    if (besoinN && !/import \{[^}]*\bN_\b[^}]*\} from "@\/lib\/i18n\/translate"/.test(out)) out = ajouterImport(out, 'import { N_ } from "@/lib/i18n/translate";');
    fs.writeFileSync(f, out);
  }
}
console.log("TOTAL", total);
