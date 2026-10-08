// Dérive src/components/ReinitMotDePasse.tsx (3 étapes branchées) depuis src/ports/MotDePasseOublie.tsx.
import { readFileSync, writeFileSync } from "node:fs";
let s = readFileSync("src/ports/MotDePasseOublie.tsx", "utf8");
const must = (c, m) => { if (!c) throw new Error("patch-reinit: " + m); };
const rep = (a, b) => { must(s.includes(a), "introuvable → " + a.slice(0, 80)); s = s.replace(a, () => b); };

s = s.replace(/^\/\/ Porté depuis.*\n/, "").replace(/export const bodyClass.*\n/, "");

// Cartes : seule l'étape courante est active
const FINS = ["shadow-sm hover:shadow-md transition-all", "shadow-md ring-2 ring-primary/25 transition-all", "shadow-sm hover:shadow-md transition-all"];
FINS.forEach((fin, i) => {
  const n = i + 1;
  const ancien = `<div className="group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest ${fin}">`;
  rep(ancien, `<div {...(etape !== ${n} ? { inert: true } : {})} className={\`group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm transition-all \${etape !== ${n} ? "opacity-50" : "ring-2 ring-primary-container"}\`}>`);
});

// Étape 1
rep('<form className="space-y-space-md" id="step1-form">', '<form action={demanderReinitialisation} className="space-y-space-md" id="step1-form">');
s = s.replace(/<form([^>]*)id="step1-form">/, (m, a) => m); // (sécurité si la classe diffère)
s = s.replace('id="phone-input" name="phone" placeholder="77 000 00 00" required type="tel" defaultValue="77 418 29 45"', 'id="phone-input" name="telephone" placeholder="77 000 00 00" required type="tel"');

// Étape 2 : bloc code + bouton remplacé par un composant client
const a = s.indexOf('<div className="mb-space-lg">');
const finBouton = s.indexOf("<span>Valider le code</span>");
must(a > 0 && finBouton > a, "bloc étape 2");
const b = s.indexOf("</button>", finBouton) + "</button>".length;
s = s.slice(0, a) + "<CodeReinit />" + s.slice(b);
rep('<strong className="text-on-surface font-semibold">+221 77 418 29 45</strong>', '<strong className="text-on-surface font-semibold">{telephone}</strong>');

// Étape 3
s = s.replace(/<form([^>]*)id="step3-form">/, (m, a) => `<form action={nouveauMotDePasse}${a}id="step3-form">`);
rep('id="new-pass" placeholder="••••••••••••" required type="password" defaultValue="BailleurDakar2026!"', 'id="new-pass" name="motDePasse" minLength={8} placeholder="••••••••••••" required type="password"');
rep('id="confirm-pass" placeholder="••••••••••••" required type="password" defaultValue="BailleurDakar2026!"', 'id="confirm-pass" name="confirmation" minLength={8} placeholder="••••••••••••" required type="password"');


// Indicateur d'étapes du haut : reflète l'étape courante
rep('<div className="absolute top-1/2 left-16 w-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500"></div>',
  '<div className="absolute top-1/2 left-16 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: etape === 1 ? "0%" : etape === 2 ? "50%" : "100%" }}></div>');
const ACTIF = 'w-7 h-7 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center text-xs';
const INACTIF = 'w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant font-headline-sm text-headline-sm flex items-center justify-center text-xs';
const pastille = (n) => '<div className={`' + '${etape >= ' + n + ' ? "' + ACTIF + '" : "' + INACTIF + '"}' + '${etape === ' + n + ' ? " ring-4 ring-primary/20" : ""}`}>' + n + '</div>';
rep('<div className="' + ACTIF + '">1</div>', pastille(1));
rep('<div className="' + ACTIF + ' ring-4 ring-primary/20">2</div>', pastille(2));
rep('<div className="' + INACTIF + '">3</div>', pastille(3));

// Entête : erreur + code de développement
rep("export default function MotDePasseOublie() {\n  return (\n    <>",
`export default function ReinitMotDePasse({ etape, erreur, telephone, devCode }: { etape: 1 | 2 | 3; erreur?: string; telephone: string; devCode?: string | null }) {
  return (
    <>
      {(erreur || (etape === 2 && devCode)) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(92vw,28rem)]">
          {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-4 py-2 font-body-md text-body-md shadow-md">{erreur}</p>}
          {etape === 2 && devCode && (
            <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-4 py-2 font-body-md text-body-md shadow-md">
              Mode développement : votre code est <strong>{devCode}</strong>
            </p>
          )}
        </div>
      )}`);
s = 'import CodeReinit from "@/components/CodeReinit";\nimport { demanderReinitialisation, nouveauMotDePasse } from "@/app/actions/reinit";\n\n' + s;
writeFileSync("src/components/ReinitMotDePasse.tsx", s);
console.log("ok");
