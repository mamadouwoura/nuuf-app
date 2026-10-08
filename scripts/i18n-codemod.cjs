// Enveloppe les textes français statiques des composants avec t("..."), et liste les phrases dynamiques à traiter à la main.
// Usage : node scripts/i18n-codemod.cjs [--ecrire] fichier1.tsx fichier2.tsx ...
const ts = require("typescript");
const fs = require("node:fs");

const ecrire = process.argv.includes("--ecrire");
const fichiers = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const LETTRES = /[A-Za-zÀ-ÿ]{2,}/;
const ATTRS = new Set(["aria-label", "placeholder", "title", "alt", "label", "aria-description"]);

const NEUTRES = new Set(['FCFA','XOF','Wave','Orange Money','Orange','Nuuf','QR','PDF','WhatsApp','SMS','NINEA','OTP','Pro','HTTPS','Mbps','m²','Free Money','FR','EN','CNI','Email','E-mail','Q-2026','CSV','Excel','USSD','1-Clic','Push USSD','Wave Business','Wave Sénégal','Sénégal','Dakar','Thiès','Mbour','Almadies']);
const estIcone = (txt) => /^[a-z]+(_[a-z0-9]+)*$/.test(txt) && !txt.includes(" ") && txt.length > 1; // noms d'icônes Material Symbols
const echapper = (s) => JSON.stringify(s);

let totalGlobal = 0;
for (const f of fichiers) {
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const client = /^\s*["']use client["']/.test(src);
  const edits = []; // {start,end,texte}
  const manuel = [];
  const composants = new Set(); // fonctions de composant qui auront besoin de t

  const racine = (node) => {
    // fonction de plus haut niveau contenant le nœud
    let n = node, derniere = null;
    while (n && n.parent) {
      if ((ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && (ts.isSourceFile(n.parent) || ts.isVariableDeclaration(n.parent) || ts.isExportAssignment(n.parent) || ts.isVariableStatement(n.parent?.parent ?? n.parent))) {
        let p = n.parent;
        if (ts.isVariableDeclaration(p)) { const st = p.parent?.parent; if (st && ts.isVariableStatement(st) && ts.isSourceFile(st.parent)) derniere = n; }
        else if (ts.isSourceFile(p) || ts.isExportAssignment(p)) derniere = n;
      }
      n = n.parent;
    }
    return derniere;
  };

  function visiter(node) {
    // Enfants JSX : regrouper les suites texte/expression
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const enfants = node.children;
      let i = 0;
      while (i < enfants.length) {
        if (!(ts.isJsxText(enfants[i]) || ts.isJsxExpression(enfants[i]))) { i++; continue; }
        let j = i;
        while (j < enfants.length && (ts.isJsxText(enfants[j]) || ts.isJsxExpression(enfants[j]))) j++;
        const groupe = enfants.slice(i, j);
        const textes = groupe.filter((c) => ts.isJsxText(c) && LETTRES.test(c.getText().replace(/&[a-z]+;/g, "")) && !estIcone(c.getText().trim()) && !NEUTRES.has(c.getText().trim().replace(/^[•·-–—:/(]+|[•·-–—:/)]+$/g, "").trim()));
        const exprs = groupe.filter((c) => ts.isJsxExpression(c) && c.expression);
        const exprsTexte = exprs.filter((c) => !ts.isStringLiteral(c.expression) || true);
        if (textes.length) {
          if (textes.length === 1 && groupe.every((c) => c === textes[0] || (ts.isJsxText(c) && !c.getText().trim()))) {
            const c = textes[0];
            const brut = c.getText();
            const lead = brut.match(/^\s*/)[0], trail = brut.match(/\s*$/)[0];
            const coeur = brut.trim().replace(/\s+/g, " ");
            const entites = /&[a-z#0-9]+;/.test(coeur);
            if (entites) {
              const d = coeur.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
              if (/&[a-z#0-9]+;/.test(d)) { manuel.push([sf.getLineAndCharacterOfPosition(c.getStart()).line + 1, "entité: " + coeur]); }
              else edits.push({ start: c.getStart() - (brut.length - brut.trimStart().length) + lead.length - lead.length, end: c.getEnd(), texte: lead + "{t(" + echapper(d) + ")}" + trail, node: c });
            } else if (!/[{}]/.test(coeur)) {
              edits.push({ start: c.getStart() - 0, end: c.getEnd(), texte: lead + "{t(" + echapper(coeur) + ")}" + trail, node: c });
            } else manuel.push([sf.getLineAndCharacterOfPosition(c.getStart()).line + 1, "accolades: " + coeur]);
          } else {
            const l = sf.getLineAndCharacterOfPosition(textes[0].getStart()).line + 1;
            manuel.push([l, "phrase dynamique: " + groupe.map((c) => c.getText().replace(/\s+/g, " ").trim()).join(" ").slice(0, 150)]);
          }
        }
        i = j;
      }
    }
    // Attributs de texte
    if (ts.isJsxAttribute(node) && node.initializer && ATTRS.has(node.name.getText())) {
      const ini = node.initializer;
      if (ts.isStringLiteral(ini) && LETTRES.test(ini.text) && !estIcone(ini.text)) {
        edits.push({ start: ini.getStart(), end: ini.getEnd(), texte: "{t(" + echapper(ini.text) + ")}", node: ini });
      }
    }
    ts.forEachChild(node, visiter);
  }
  visiter(sf);

  for (const e of edits) { const r = racine(e.node); if (r) composants.add(r); else manuel.push([sf.getLineAndCharacterOfPosition(e.node.getStart()).line + 1, "hors composant: " + e.texte.slice(0, 80)]); }
  totalGlobal += edits.length;
  console.log(`${f}: ${edits.length} textes enveloppés, ${manuel.length} à traiter à la main`);
  for (const [l, m] of manuel) console.log(`   L${l} ${m}`);

  if (ecrire && edits.length) {
    let out = src;
    // insertion de t dans les composants (de la fin vers le début)
    const inserts = [];
    for (const fn of composants) {
      const corps = fn.body;
      if (!corps) continue;
      const cible = client ? "const { t } = useT();" : "const { t } = await getT();";
      if (ts.isBlock(corps)) {
        if (/\bconst \{[^}]*\bt\b[^}]*\} = (useT|await getT)\(\)/.test(corps.getText())) continue;
        inserts.push({ pos: corps.getStart() + 1, texte: "\n  " + cible, fn });
      } else {
        // corps en expression : (...) => ( <jsx/> ) → convertir en bloc
        inserts.push({ pos: corps.getStart(), end: corps.getEnd(), texte: "{\n  " + cible + "\n  return " + (ts.isParenthesizedExpression(corps) ? corps.getText() : "(" + corps.getText() + ")") + ";\n}", expr: true, fn });
      }
    }
    const tous = [...edits.map((e) => ({ pos: e.start, end: e.end, texte: e.texte })), ...inserts.map((i) => ({ pos: i.pos, end: i.expr ? i.end : i.pos, texte: i.texte }))].sort((a, b) => b.pos - a.pos);
    for (const e of tous) out = out.slice(0, e.pos) + e.texte + out.slice(e.end);
    // rendre async les composants serveur
    if (!client) {
      const sf2 = ts.createSourceFile(f, out, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const asyncs = [];
      (function v(n) {
        if ((ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && n.body && /await getT\(\)/.test(n.body.getText()) && !(n.modifiers || []).some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) asyncs.push(n);
        ts.forEachChild(n, v);
      })(sf2);
      asyncs.sort((a, b) => b.getStart() - a.getStart());
      for (const n of asyncs) {
        if (ts.isArrowFunction(n)) out = out.slice(0, n.getStart()) + "async " + out.slice(n.getStart());
        else {
          const m = out.slice(n.getStart()).match(/^(export\s+)?(default\s+)?function/);
          const pre = m ? (m[1] || "") + (m[2] || "") : "";
          out = out.slice(0, n.getStart()) + pre + "async function" + out.slice(n.getStart() + pre.length + "function".length);
        }
      }
    }
    // imports
    const imp = client ? 'import { useT } from "@/lib/i18n/client";' : 'import { getT } from "@/lib/i18n/server";';
    if (!out.includes(imp)) {
      const lignes = out.split("\n");
      let dernier = -1;
      lignes.forEach((l, i) => { if (/^import .*;\s*$/.test(l) || /^} from ".*";\s*$/.test(l)) dernier = i; });
      lignes.splice(dernier + 1, 0, imp);
      out = lignes.join("\n");
    }
    fs.writeFileSync(f, out);
  }
}
console.log("TOTAL enveloppés:", totalGlobal);
