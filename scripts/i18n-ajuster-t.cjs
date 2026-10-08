// Ajuste `const { t, tn, locale } = await getT()/useT()` aux noms réellement utilisés dans CHAQUE fonction.
const { ts, fs, path } = require("./_i18n-lib.cjs");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const p of walk("src").filter((x) => /\.tsx$/.test(x) && !/[\/]ports[\/]/.test(x))) {
  const src = fs.readFileSync(p, "utf8");
  if (!/=\s*(await getT|useT)\(\)/.test(src)) continue;
  const sf = ts.createSourceFile(p, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  (function v(n) {
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && /(await getT|useT)\(\)/.test(n.initializer.getText())) {
      let fn = n.parent;
      while (fn && !(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) fn = fn.parent;
      const corps = (fn ? fn.getText() : src).replace(n.getText(), "");
      const noms = ["t", "tn", "locale"].filter((x) => (x === "t" ? /\bt\(/.test(corps) || /\bt\b/.test(corps) : x === "tn" ? /\btn\(/.test(corps) : /\blocale\b/.test(corps)));
      const lib = noms.length ? noms : ["t"];
      edits.push({ s: n.name.getStart(), e: n.name.getEnd(), txt: `{ ${lib.join(", ")} }` });
    }
    ts.forEachChild(n, v);
  })(sf);
  if (!edits.length) continue;
  let out = src;
  edits.sort((a, b) => b.s - a.s).forEach((e) => (out = out.slice(0, e.s) + e.txt + out.slice(e.e)));
  if (out !== src) fs.writeFileSync(p, out);
}
