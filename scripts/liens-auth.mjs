// Branche les liens « # » des écrans d'authentification sur de vraies routes (ou les retire s'il n'y a pas de page).
import { readFileSync, writeFileSync } from "node:fs";

function editer(fichier, regles) {
  let s = readFileSync(fichier, "utf8");
  for (const [re, rempl] of regles) {
    if (!re.test(s)) throw new Error(`${fichier}: introuvable → ${re}`);
    s = s.replace(re, rempl);
  }
  writeFileSync(fichier, s);
  console.log("ok", fichier);
}
const lien = (cible) => (m, avant, apres) => `${avant}href="${cible}"${apres}`;
const sansPage = (m, attrs, texte) => `<span ${attrs.replace(/data-path="[^"]*"\s*/, "")}>${texte}</span>`;

editer("src/ports/Connexion.tsx", [
  [/(<a [^>]*)href="#"(>\s*Mot de passe oublié)/, lien("/mot-de-passe-oublie")],
  [/(<a [^>]*)href="#"(>\s*Créer mon compte bailleur)/, lien("/inscription")],
]);
editer("src/ports/Inscription.tsx", [
  [/(<a [^>]*)href="#"(>\s*<span [^>]*>support_agent)/, (m, a, b) => `${a}href={lienContact} target="_blank"${b}`],
  [/(<a [^>]*)href="#"(>Se connecter à mon espace)/, lien("/connexion")],
  [/<a ([^>]*?)href="#">(Mentions légales)<\/a>/, sansPage],
  [/<a ([^>]*?)href="#">(Confidentialité)<\/a>/, sansPage],
  [/<a ([^>]*?)href="#">(conditions générales d'utilisation)<\/a>/, sansPage],
  [/^/, 'import { lienContact } from "@/components/PublicLayout";\n'],
]);
editer("src/ports/VerificationNumero.tsx", [
  [/(<a [^>]*)href="#"(>\s*<span [^>]*>\s*<span [^>]*>arrow_back)/, lien("/connexion")],
  [/(<a [^>]*)href="#"(>Mauvais numéro \?)/, lien("/connexion")],
  [/<a ([^>]*?)href="#">(Conditions générales)<\/a>/, sansPage],
  [/(<a [^>]*)href="#"(>Support 24\/7)/, (m, a, b) => `${a}href={lienContact} target="_blank"${b}`],
  [/^/, 'import { lienContact } from "@/components/PublicLayout";\n'],
]);
editer("src/components/ReinitMotDePasse.tsx", [
  [/data-path="login" href="#"/g, 'href="/connexion"'],
  [/<a ([^>]*?)data-path="confidentialite" href="#">([^<]*)<\/a>/, sansPage],
  [/<a ([^>]*?)data-path="mentions-legales" href="#">([^<]*)<\/a>/, sansPage],
]);
