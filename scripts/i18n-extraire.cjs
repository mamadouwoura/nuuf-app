// Extrait les clés de traduction du code : t("…"), tn("…", "…"), N_("…").
// Usage : node scripts/i18n-extraire.cjs             → toutes les clés (JSON)
//         node scripts/i18n-extraire.cjs --client    → écrit la liste des clés des composants client (dictionnaire embarqué dans les pages)
//         node scripts/i18n-extraire.cjs --verifier  → compare avec le dictionnaire anglais ; code de sortie 1 s'il manque des clés
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");

const CLIENT = "src/lib/i18n/dictionaries/cles-client.json";
const DICO_EN = "src/lib/i18n/dictionaries/en.json";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const fichiers = walk("src").filter((f) => /\.tsx?$/.test(f) && !/[\\/]ports[\\/](?!Connexion|Inscription|VerificationNumero)/.test(f));
const tri = (liste) => [...liste].sort((a, b) => a.localeCompare(b, "fr"));

function extraire(seulementClient = false) {
  const cles = new Map(); // clé -> fichier:ligne
  for (const f of fichiers) {
    const src = fs.readFileSync(f, "utf8");
    if (seulementClient && !/^\s*["']use client["']/.test(src)) continue;
    const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    (function visiter(n) {
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
        const nom = n.expression.text;
        const lit = (a) => (a && (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a)) ? a.text : null);
        const ajout = (txt) => {
          if (txt != null && !cles.has(txt)) cles.set(txt, `${f}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
        };
        if (nom === "t" || nom === "N_") ajout(lit(n.arguments[0]));
        if (nom === "tn") {
          ajout(lit(n.arguments[1]));
          ajout(lit(n.arguments[2]));
        }
      }
      ts.forEachChild(n, visiter);
    })(sf);
  }
  return cles;
}

module.exports = { extraire, tri, CLIENT, DICO_EN };

if (require.main === module) {
  const cles = extraire();
  if (process.argv.includes("--client")) {
    const liste = tri(extraire(true).keys());
    fs.writeFileSync(CLIENT, JSON.stringify(liste, null, 1) + "\n");
    console.log(liste.length + " clés côté client écrites");
  } else if (process.argv.includes("--verifier")) {
    const dict = JSON.parse(fs.readFileSync(DICO_EN, "utf8"));
    const manquantes = [...cles.keys()].filter((k) => !dict[k]);
    const inutiles = Object.keys(dict).filter((k) => !cles.has(k));
    console.log(`${cles.size} clés, ${manquantes.length} manquantes, ${inutiles.length} inutilisées`);
    manquantes.slice(0, 40).forEach((k) => console.log("  MANQUE:", k.slice(0, 100), "←", cles.get(k)));
    inutiles.slice(0, 20).forEach((k) => console.log("  INUTILE:", k.slice(0, 100)));
    const attendu = JSON.stringify(tri(extraire(true).keys()), null, 1) + "\n";
    const perime = !fs.existsSync(CLIENT) || fs.readFileSync(CLIENT, "utf8") !== attendu;
    if (perime) console.log("  La liste des clés client est périmée : lancez  npm run i18n:cles");
    process.exit(manquantes.length || perime ? 1 : 0);
  } else {
    console.log(JSON.stringify(tri(cles.keys()), null, 1));
  }
}
