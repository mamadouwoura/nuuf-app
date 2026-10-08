// Logique commune au scan et au codemod : quels littéraux ressemblent à du texte français à traduire.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const EXCLUS = [/[\\/]ports[\\/](?!Connexion|Inscription|VerificationNumero)/, /[\\/]lib[\\/]i18n[\\/]/, /global-error/, /[\\/]lib[\\/](quittance|contrat|messagerie|relances-auto)\.ts$/, /[\\/]app[\\/]actions[\\/]langue/];
const fichiers = walk("src").filter((f) => /\.tsx?$/.test(f) && !EXCLUS.some((r) => r.test(f)));

const ATTRS_TEXTE = new Set(["aria-label", "placeholder", "title", "alt", "label", "aria-description"]);
const TOKEN_TAILWIND = /^[a-z0-9:\/\[\]\.\-#%()_!@,>*&=+'"~^|$]+$/;
const motsUtilitaires = new Set(["flex", "block", "hidden", "grid", "relative", "absolute", "fixed", "sticky", "inline", "truncate", "uppercase", "lowercase", "capitalize", "italic", "underline", "border", "rounded", "shadow", "transition", "contents", "static", "visible", "invisible", "collapse", "grow", "shrink", "container", "antialiased", "outline", "resize", "ring", "peer", "group", "table", "inline-flex"]);

const NOMS_PROPRES = new Set(["Dakar", "Thiès", "Mbour", "Saly", "Wave", "Orange Money", "Wave Sénégal", "Almadies, Dakar", "Nuuf", "Pro", "Sénégal", "Free Money", "Autre"]);
function ressembleTexte(s) {
  const t = s.trim();
  if (NOMS_PROPRES.has(t)) return false;
  if (t.length < 2) return false;
  if (!/[A-Za-zÀ-ÿ]{2,}/.test(t)) return false;
  if (/^(https?:|\/|#|\.|\w+:\/\/|mailto:|data:)/.test(t)) return false;
  if (/^[A-Z0-9_]+$/.test(t)) return false; // constantes / énumérations
  if (/^[a-z]+(_[a-z0-9]+)+$/.test(t)) return false; // icônes Material Symbols / identifiants
  if (/^[\w.-]+@[\w.-]+$/.test(t)) return false;
  const jetons = t.split(/\s+/);
  if (jetons.every((j) => TOKEN_TAILWIND.test(j) && (!/[A-Z]/.test(j) || /[\[#]/.test(j)))) {
    if (jetons.length === 1 || jetons.every((j) => /[-:\[\]\/]/.test(j) || motsUtilitaires.has(j))) return false; // classes Tailwind
  }
  if (jetons.length === 1) return /^[A-ZÀ-Ý][a-zà-ÿ]{3,}/.test(t) || /[à-ÿ]/.test(t); // un mot : majuscule initiale ou accent
  return /[a-zà-ÿ]{2,}/i.test(t);
}


function littereauxTexte(sf) {
  const res = [];
  (function v(n) {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      const p = n.parent;
      const texte = ts.isTemplateExpression(n) ? n.getText().slice(1, -1) : n.text;
      let ignore = false;
      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isExternalModuleReference(p)) ignore = true;
      if (ts.isPropertyAssignment(p) && p.name === n) ignore = true;
      if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && ["t", "tn", "N_", "require", "redirect", "sign", "poserJeton", "lireJeton", "retirerJeton"].includes(p.expression.text)) ignore = true;
      if (ts.isExpressionStatement(p)) ignore = true;
      if (ts.isJsxAttribute(p) && !ATTRS_TEXTE.has(p.name.getText())) ignore = true;
      if (ts.isElementAccessExpression(p) && p.argumentExpression === n) ignore = true;
      if (ts.isCaseClause(p) || (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind))) ignore = true;
      if (ts.isTemplateSpan(p)) ignore = true;
      let a = p; while (a && !ts.isJsxAttribute(a) && !ts.isSourceFile(a)) a = a.parent;
      if (a && ts.isJsxAttribute(a) && !ATTRS_TEXTE.has(a.name.getText())) ignore = true;
      if (!ignore && ressembleTexte(texte)) res.push({ node: n, texte });
    }
    ts.forEachChild(n, v);
  })(sf);
  return res;
}
module.exports = { ts, fs, path, fichiers, littereauxTexte, ressembleTexte };
