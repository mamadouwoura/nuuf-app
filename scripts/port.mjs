// Convertit un écran Stitch (code.html) en composant TSX.
// Usage : node scripts/port.mjs <dossier-ecran> <NomComposant> [--main]
//   --main : ne garde que l'intérieur de <main> (écrans avec sidebar + en-tête).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:/Users/WIN11/Desktop/Nuuf/stitch_plateforme_saas_immobili_re_nuuf";
const [, , dir, name, flag] = process.argv;
let html = readFileSync(join(SRC, dir, "code.html"), "utf8");

const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let inner = body ? body[1] : html;
const bodyClass = body ? (html.match(/<body[^>]*class="([^"]*)"/i) || [])[1] : "";

inner = inner
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "");

if (flag === "--main") {
  const m = inner.match(/<main[^>]*>([\s\S]*)<\/main>/i);
  if (!m) throw new Error("pas de <main>");
  inner = m[1];
}

const ATTR = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly",
  maxlength: "maxLength", minlength: "minLength", autocomplete: "autoComplete",
  autofocus: "autoFocus", inputmode: "inputMode", colspan: "colSpan", rowspan: "rowSpan",
  viewbox: "viewBox", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin", "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset", "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule", "clip-rule": "clipRule", "fill-opacity": "fillOpacity",
  "stop-color": "stopColor", "stop-opacity": "stopOpacity", "text-anchor": "textAnchor",
  "font-size": "fontSize", "font-family": "fontFamily", "font-weight": "fontWeight",
  "clip-path": "clipPath", "stroke-miterlimit": "strokeMiterlimit",
  "gradientunits": "gradientUnits", "gradienttransform": "gradientTransform",
  srcset: "srcSet", crossorigin: "crossOrigin", datetime: "dateTime", enctype: "encType",
  accesskey: "accessKey", preserveaspectratio: "preserveAspectRatio", "xlink:href": "xlinkHref", contenteditable: "contentEditable",
};

function styleToObj(css) {
  const parts = css.split(";").map((s) => s.trim()).filter(Boolean).map((decl) => {
    const i = decl.indexOf(":");
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    const key = k.startsWith("--") ? JSON.stringify(k) : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `${key}: ${JSON.stringify(v)}`;
  });
  return `{{ ${parts.join(", ")} }}`;
}

// Attributs au niveau de chaque balise ouvrante
inner = inner.replace(/<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g, (all, tag, attrs, selfClose) => {
  if (!attrs.trim() && !selfClose) return all;
  let out = "";
  const re = /\s+([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let a;
  while ((a = re.exec(attrs))) {
    const [, rawName, v1, v2] = a;
    const val = v1 ?? v2;
    const lower = rawName.toLowerCase();
    if (lower.startsWith("on")) continue; // handlers inline : réécrits à la main
    if (lower === "style" && val != null) { out += ` style=${styleToObj(val)}`; continue; }
    let n = ATTR[rawName] ?? ATTR[lower] ?? rawName;
    if (tag === "input" || tag === "textarea" || tag === "select") {
      if (n === "value") n = "defaultValue";
      if (n === "checked") n = "defaultChecked";
    }
    const BOOL = ["disabled","required","checked","defaultChecked","hidden","multiple","selected","open","autoFocus","readOnly","controls","autoplay","loop","muted","playsinline"];
    const NUM = ["maxLength","minLength","colSpan","rowSpan","rows","cols","size","tabIndex"];
    if (BOOL.includes(n)) { out += ` ${n}`; continue; }
    if (NUM.includes(n) && val != null && /^-?[0-9]+$/.test(val)) { out += ` ${n}={${val}}`; continue; }
    if (val == null) { out += ` ${n}`; continue; }
    out += ` ${n}=${JSON.stringify(val).replace(/\\"/g, "&quot;")}`;
  }
  const voidTags = ["input", "img", "br", "hr", "link", "meta", "source", "col", "wbr"];
  const close = selfClose || voidTags.includes(tag.toLowerCase()) ? " /" : "";
  return `<${tag}${out}${close}>`;
});

// Casse des balises SVG
for (const t of ["linearGradient","radialGradient","clipPath","foreignObject","textPath"]) {
  inner = inner.replace(new RegExp("<(/?)" + t.toLowerCase() + "(?=[\\s/>])", "g"), "<$1" + t);
}
// Les balises void écrites sans fermeture (<br>) sont déjà gérées ci-dessus.
// Textarea : le contenu devient defaultValue
inner = inner.replace(/<textarea([^>]*)>([\s\S]*?)<\/textarea>/g, (_, a, t) =>
  `<textarea${a} defaultValue=${JSON.stringify(t.trim())} />`);

// Accolades dans le texte
inner = inner.replace(/>([^<>]*[{}][^<>]*)</g, (_, t) =>
  `>${t.replace(/\{/g, "{'{'}").replace(/\}/g, "{'}'}")}<`);

const hasClient = false;
const out = `${hasClient ? '"use client";\n\n' : ""}// Porté depuis ${dir}/code.html (généré par scripts/port.mjs)
export const bodyClass = ${JSON.stringify(bodyClass ?? "")};

export default function ${name}() {
  return (
    <>
${inner.trim().split("\n").map((l) => "      " + l).join("\n")}
    </>
  );
}
`;
mkdirSync("src/ports", { recursive: true });
writeFileSync(`src/ports/${name}.tsx`, out);
console.log(`ok src/ports/${name}.tsx (${out.length} octets)`);
