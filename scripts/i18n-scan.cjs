// Liste les textes français encore « en dur » dans le code (hors t(), tn(), N_()). Usage : node scripts/i18n-scan.cjs [--json]
const { ts, fs, fichiers, littereauxTexte } = require("./_i18n-lib.cjs");

const trouves = [];
for (const f of fichiers) {
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const { node, texte } of littereauxTexte(sf)) {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
    trouves.push({ f, l: line + 1, s: texte.replace(/\s+/g, " ").slice(0, 110) });
  }
  (function v(n) {
    if (ts.isJsxText(n)) {
      const txt = n.getText().replace(/\s+/g, " ").trim();
      if (txt && /[A-Za-zÀ-ÿ]{3,}/.test(txt) && !/^[a-z_0-9]+$/.test(txt) && !/^(FCFA|XOF|Wave|Orange Money|Nuuf|PDF|QR|WhatsApp|Pro)$/.test(txt.replace(/[•·\-–—:/()]/g, "").trim())) {
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart());
        trouves.push({ f, l: line + 1, s: "[JSX] " + txt.slice(0, 100) });
      }
    }
    ts.forEachChild(n, v);
  })(sf);
}
if (process.argv.includes("--json")) console.log(JSON.stringify(trouves, null, 1));
else {
  const par = {};
  for (const t of trouves) (par[t.f] ??= []).push(t);
  for (const [f, l] of Object.entries(par)) {
    console.log(`\n${f} (${l.length})`);
    for (const t of l) console.log(`  L${t.l}: ${t.s}`);
  }
  console.log(`\nTOTAL: ${trouves.length} dans ${Object.keys(par).length} fichiers`);
}
