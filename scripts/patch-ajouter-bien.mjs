// Dérive src/components/AjouterBienForm.tsx (client, branché) depuis src/ports/AjouterBien.tsx.
import { readFileSync, writeFileSync } from "node:fs";
let s = readFileSync("src/ports/AjouterBien.tsx", "utf8");
const must = (cond, msg) => { if (!cond) throw new Error("patch: " + msg); };
const rep = (a, b) => { must(s.includes(a), a.slice(0, 70)); s = s.replace(a, () => b); };

s = s.replace(/^\/\/ Porté depuis.*\n/, "").replace(/export const bodyClass.*\n/, "");
rep("export default function AjouterBien() {\n  return (\n    <>",
`export default function AjouterBienForm({ erreur }: { erreur?: string }) {
  const [designation, setDesignation] = useState("");
  const [quartier, setQuartier] = useState("Almadies, Dakar");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [loyer, setLoyer] = useState("");
  const [caution, setCaution] = useState("");
  const [debut, setDebut] = useState("");
  const [jour, setJour] = useState("5");
  const chiffres = (v: string) => Number(v.replace(/\\D/g, "")) || 0;
  const fmt = (v: string) => (chiffres(v) ? String(chiffres(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ") : "—");
  const initiales = nom.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const moisCaution = chiffres(loyer) && chiffres(caution) ? Math.round((chiffres(caution) / chiffres(loyer)) * 10) / 10 : null;
  const dateFr = debut ? new Date(debut).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  return (
    <form action={creerBienEtLocataire}>
      {erreur && (
        <p role="alert" className="mb-space-md rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">
          {erreur}
        </p>
      )}`);
s = s.replace(/\n    <\/>\n  \);\n}\s*$/, "\n    </form>\n  );\n}\n");
s = '"use client";\n\nimport { useState } from "react";\nimport { creerBienEtLocataire } from "@/app/actions/biens";\n\n' + s;

// Brouillon : non implémenté, on retire bouton + pastille
s = s.replace(/<button[^>]*>\s*<span[^>]*>save<\/span>\s*Enregistrer en brouillon\s*<\/button>\s*<span[^>]*>\s*<span[^>]*><\/span>\s*Brouillon auto-sauvegardé\s*<\/span>/, "");
must(!s.includes("Enregistrer en brouillon"), "brouillon");

// Type de bien : radios stylés
const types = [["APPARTEMENT", "domain", "Appartement"], ["VILLA", "villa", "Villa"], ["STUDIO", "single_bed", "Studio"], ["COMMERCIAL", "storefront", "Commercial"]];
for (const [val, icon, label] of types) {
  const re = new RegExp(`<button className="[^"]*" type="button">\\s*<span className="material-symbols-outlined text-\\[22px\\] mb-1">${icon}</span>\\s*${label}\\s*</button>`);
  must(re.test(s), "chip " + label);
  s = s.replace(re, () => `<label className="cursor-pointer"><input type="radio" name="type" value="${val}" className="peer sr-only"${val === "APPARTEMENT" ? " defaultChecked" : ""} /><span className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm"><span className="material-symbols-outlined text-[22px] mb-1">${icon}</span>${label}</span></label>`);
}

const field = (def, attrs) => rep(`defaultValue="${def}"`, attrs);
field("Appartement F3 Standing - Ngor Almadies (B4)", `name="designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Appartement F3 - Ouakam, 2e étage"`);
field("115", `name="surfaceM2" placeholder="85"`);
field("0428 9912 401", `name="compteurElec"`);
field("EAU-ALM-B4-202", `name="compteurEau"`);
field("Aminata Diallo", `name="locNom" required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Prénom et nom"`);
field("77 645 89 20", `name="locTel" required value={tel} onChange={(e) => setTel(e.target.value)} placeholder="77 000 00 00"`);
field("1 752 1993 02847", `name="locCni"`);
field("aminata.diallo@sonatel.sn", `name="locEmail"`);
field("Ingénieure Réseau chez Sonatel Orange", `name="locProfession"`);
field("250 000", `name="loyer" required inputMode="numeric" value={loyer} onChange={(e) => setLoyer(e.target.value)} placeholder="250 000"`);
field("500 000", `name="caution" inputMode="numeric" value={caution} onChange={(e) => setCaution(e.target.value)} placeholder="500 000"`);
field("2026-11-01", `name="debut" required value={debut} onChange={(e) => setDebut(e.target.value)}`);

// Selects (deux, dans l'ordre : quartier puis jour)
const SEL = '<select className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr';
rep(SEL, '<select name="quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr');
rep(SEL, '<select name="jour" value={jour} onChange={(e) => setJour(e.target.value)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr');
rep("<option selected>Almadies, Dakar</option>", "<option>Almadies, Dakar</option>");
rep("<option selected>Le 05 de chaque mois</option>\n      <option>Le 01 de chaque mois</option>\n      <option>Le 10 de chaque mois</option>",
    '<option value="5">Le 05 de chaque mois</option>\n      <option value="1">Le 01 de chaque mois</option>\n      <option value="10">Le 10 de chaque mois</option>');

// Aperçu dynamique
rep("Bail N° DK-2026-088", "Nouveau bail");
rep(">Almadies, Dakar</span>\n      <h3", ">{quartier}</span>\n      <h3");
rep(">Appartement F3 Standing - Ngor Almadies</h3>", '>{designation || "Nouveau bien"}</h3>');
rep("AD\n                    </div>", "{initiales}\n                    </div>");
rep(">Aminata Diallo</span>", '>{nom || "Locataire"}</span>');
rep(">+221 77 645 89 20</span>", ">+221 {tel}</span>");
rep(">250 000 <span", ">{fmt(loyer)} <span");
rep(">500 000 <span", ">{fmt(caution)} <span");
rep(">2 mois de loyer</span>", '>{moisCaution ? `${moisCaution} mois de loyer` : "—"}</span>');
rep(">01 Novembre 2026</span>", ">{dateFr}</span>");
rep(">Chaque 05 du mois</span>", '>Chaque {jour.padStart(2, "0")} du mois</span>');
rep("seront envoyés par WhatsApp et SMS à Aminata Diallo.", 'seront envoyés par WhatsApp et SMS à {nom || "votre locataire"}.');

// CTA principal -> submit ; libellé honnête (l'envoi WhatsApp arrive en phase 2)
rep('type="button">\n      <span>Envoyer le 1<sup>er</sup> lien de paiement</span>', 'type="submit">\n      <span>Enregistrer le bien et le locataire</span>');
writeFileSync("src/components/AjouterBienForm.tsx", s);
console.log("ok");
