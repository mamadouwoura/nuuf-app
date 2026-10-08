// Dérive src/components/Accueil.tsx (vitrine publique, honnête et branchée) depuis src/ports/Accueil.tsx.
import { readFileSync, writeFileSync } from "node:fs";
let s = readFileSync("src/ports/Accueil.tsx", "utf8");
const must = (c, m) => { if (!c) throw new Error("patch-accueil: " + m); };
const rep = (a, b) => { must(s.includes(a), "introuvable → " + a.slice(0, 70)); s = s.split(a).join(b); };
const reg = (r, b) => { must(r.test(s), "regex → " + r); s = s.replace(r, () => b); };

s = s.replace(/^\/\/ Porté depuis.*\n/, "").replace(/export const bodyClass.*\n/, "");

// 1. En-tête et pieds de page : remplacés par PublicHeader / PublicFooter
reg(/<header className="fixed top-0[\s\S]*?<\/header>/, "");
s = s.replace(/<footer[\s\S]*?<\/footer>/g, "");
s = s.replace(/<main className="w-full pt-20 bg-background min-h-screen">/, '<main className="w-full pt-20 bg-background min-h-screen">');

// 2. Sections fictives retirées (chiffres inventés, témoignages)
function retirerSectionContenant(texte) {
  const i = s.indexOf(texte);
  must(i >= 0, "section contenant " + texte);
  const debut = s.lastIndexOf("<section", i);
  const fin = s.indexOf("</section>", i) + "</section>".length;
  s = s.slice(0, debut) + s.slice(fin);
}
retirerSectionContenant("-78%");
retirerSectionContenant("Retours d'expérience");

// 3. Textes exacts
rep("La 1ère plateforme de gestion locative au Sénégal • Conforme BCEAO & COCC", "La gestion locative pensée pour les bailleurs du Sénégal");
rep("Essayer gratuitement 30 jours", "Essayer gratuitement 14 jours");
rep("30 jours d'essai", "14 jours d'essai");
rep("Commencer gratuitement (30 jours offerts)", "Commencer gratuitement (14 jours offerts)");
rep("Vos 30 premiers jours sont totalement gratuits.", "Vos 14 premiers jours sont totalement gratuits, sans carte bancaire.");
rep("Rejoignez plus de 500 bailleurs sénégalais qui automatisent leur gestion locative dès aujourd'hui.", "Automatisez dès aujourd'hui l'encaissement de vos loyers et vos quittances.");
rep("Nuuf Teranga Ledger v2.4", "Aperçu du tableau de bord");
rep("En direct • Dakar", "Exemple");
rep("Archivage légal pendant 10 ans", "Quittances conservées et téléchargeables à tout moment");
rep("24h / 24", "7j / 7");
rep("accès aux baux et quittances", "accès à vos quittances et à l'historique");
rep("0 litige", "Preuve");
rep("grâce aux preuves numérisées", "chaque paiement est horodaté et tracé");
rep("Rappels personnalisés programmés dès le 1er du mois puis à l'échéance du 5. Présentez une image rigoureuse et préservez vos relations de voisinage.", "Relancez en un clic les loyers en retard par WhatsApp, avec le lien de paiement. Les rappels automatiques seront activés dès la connexion de WhatsApp Business.");
rep("Visualisez instantanément vos taux de recouvrement, identifiez les impayés résiduels et exportez votre grand livre comptable vers Excel en un clic.", "Visualisez instantanément vos taux de recouvrement, vos loyers en retard et vos encaissements par mois et par canal.");
rep("Conformité légale COCC & BCEAO", "Quittances vérifiables");
rep("Baux types et documents locatifs alignés sur le Code des Obligations Civiles et Commerciales du Sénégal, garantissant une solidité juridique maximale.", "Chaque quittance est numérotée, horodatée et vérifiable par QR code : le locataire comme le bailleur peuvent en contrôler l'authenticité.");
rep("Connectez vos flux Mobile Money favoris. Les fonds sont déposés sur votre compte sans attente ni manipulation manuelle d'espèces.", "Vos locataires paient en un clic par Wave ou Orange Money depuis un lien WhatsApp. Les loyers sont encaissés sur votre propre compte.");
rep("Dès l'encaissement validé, une quittance juridique officielle au format PDF dotée d'un code d'authentification est expédiée sur WhatsApp.", "Dès l'encaissement validé, une quittance PDF numérotée avec un QR code d'authentification est générée. Vous pouvez l'envoyer par WhatsApp en un clic.");
rep("Gérez aussi facilement un studio unique au Point E ou un complexe immobilier de 30 appartements répartis entre Mermoz, Thiès et la Petite Côte.", "Gérez aussi facilement un studio unique qu'un parc de dizaines de logements répartis entre plusieurs quartiers et villes.");


// Promesses ajustées à ce que le produit fait réellement
rep(", expédie automatiquement les quittances officielles certifiées et pilote vos relances avec tact.", ", génère automatiquement vos quittances numérotées avec QR code et facilite vos relances avec tact.");
rep("L'argent atterrit sur votre compte. Nuuf expédie instantanément la quittance certifiée conforme en format PDF directement sur le WhatsApp du locataire.", "L'argent atterrit sur votre compte. Nuuf génère aussitôt la quittance PDF numérotée, que vous pouvez envoyer au locataire sur WhatsApp en un clic.");
rep("Validation comptable instantanée", "Suivi comptable instantané");
rep("PDF certifié avec QR Code", "PDF numéroté avec QR code");
rep("Quittances certifiées automatiques", "Quittances automatiques");
rep("Votre locataire reçoit une alerte amicale et clique sur un lien sécurisé.", "Votre locataire reçoit un lien sécurisé par WhatsApp et clique dessus.");
rep("Aucun problème ! Vous pouvez consigner", "Aucun problème ! Vous pouvez consigner");

rep("et l'expédie sur WhatsApp au locataire pour tenir votre comptabilité à jour.", "que vous pouvez envoyer au locataire par WhatsApp.");
// 4. Bouton « démo » sans contenu : retiré
reg(/<button[^>]*id="trigger-demo"[\s\S]*?<\/button>/, "");

// 5. Liens : data-path -> vraies routes
const ROUTES = { inscription: "/inscription", connexion: "/connexion", tarifs: "/tarifs", fonctionnalites: "/#fonctionnalites", accueil: "/", "contact-commercial": "LIEN_CONTACT" };
s = s.replace(/<a ([^>]*?)data-path="([\w-]+)" href="#"/g, (m, avant, p) => {
  const r = ROUTES[p];
  if (!r) return m;
  return r === "LIEN_CONTACT" ? `<a ${avant}href={lienContact} target="_blank"` : `<a ${avant}href="${r}"`;
});

// 6. FAQ : accordéon natif <details>
s = s.replace(
  /<div className="([^"]*faq-item)">\s*<button className="([^"]*)" type="button">([\s\S]*?)<\/button>\s*<div className="([^"]*faq-content[^"]*)">([\s\S]*?)<\/div>\s*<\/div>/g,
  (m, c1, c2, titre, c4, texte) =>
    `<details className="${c1} group"><summary className="${c2.replace("faq-toggle ", "")} cursor-pointer list-none">${titre.replace("faq-icon transition-transform", "transition-transform group-open:rotate-180")}</summary><div className="${c4.replace("faq-content hidden ", "").replace("faq-content ", "")}">${texte}</div></details>`,
);
must(!s.includes("faq-toggle") && !s.includes("faq-content"), "faq non convertie");
const reponses = [
  ["Comment l'argent arrive-t-il", "Les loyers sont réglés directement sur votre compte Wave ou Orange Money : Nuuf ne détient jamais vos fonds. Nuuf rapproche automatiquement chaque paiement et émet la quittance."],
  ["La quittance générée a-t-elle", "Chaque quittance est numérotée, horodatée, mentionne les parties, la période et le montant, et porte un QR code qui permet d'en vérifier l'authenticité en ligne. Pour un besoin juridique précis, rapprochez-vous de votre conseil."],
  ["Combien coûte le service", "Bailleur : 10 000 FCFA/mois (jusqu'à 15 logements). Pro : 25 000 FCFA/mois (jusqu'à 50 logements, 5 accès équipe). Agence : 25 000 FCFA/mois pour 50 logements, puis 300 FCFA par logement supplémentaire. Aucun pourcentage n'est prélevé sur vos loyers."],
];
for (const [debut, txt] of reponses) {
  const re = new RegExp(`(<summary[^>]*>\\s*<span>${debut.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?<\\/summary><div className="[^"]*">)[\\s\\S]*?(<\\/div><\\/details>)`);
  must(re.test(s), "faq " + debut);
  s = s.replace(re, (m, a, b) => a + txt + b);
}

// 7. Image externe de la section « Sérénité » : remplacée par un visuel sans dépendance
reg(/<img[^>]*src="https:\/\/lh3[^>]*\/>/, '<div className="w-full h-full min-h-64 bg-gradient-to-br from-primary-container to-primary rounded-2xl" />');

s = s.replace("export default function Accueil() {", "export default function Accueil() {");
s = 'import { lienContact } from "@/components/PublicLayout";\n\n' + s;
writeFileSync("src/components/Accueil.tsx", s);
console.log("ok");
