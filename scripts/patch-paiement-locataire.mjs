// Dérive les écrans locataire branchés (formulaire de paiement, confirmation) depuis les ports.
import { readFileSync, writeFileSync } from "node:fs";

function patch(src, dest, nom, header, edits) {
  let s = readFileSync(src, "utf8");
  s = s.replace(/^\/\/ Porté depuis.*\n/, "").replace(/export const bodyClass.*\n/, "");
  const all = (a, b) => {
    if (!s.includes(a)) throw new Error(`${nom}: introuvable → ${a.slice(0, 70)}`);
    s = s.split(a).join(b);
  };
  const re = (r, b) => {
    if (!r.test(s)) throw new Error(`${nom}: regex introuvable → ${r}`);
    s = s.replace(r, () => b);
  };
  edits({ all, re });
  s = s.replace(new RegExp(`export default function \\w+\\(\\) \\{`), header);
  writeFileSync(dest, s);
  console.log("ok", dest);
}

const lien = '`https://wa.me/${d.bailleurTelBrut}`';

patch(
  "src/ports/PaiementLoyer.tsx",
  "src/components/PaiementLocataire.tsx",
  "PaiementLoyer",
  `export type DonneesPaiement = {
  jeton: string; bienNom: string; bienLieu: string; moisLabel: string; montant: string;
  bailleur: string; bailleurInit: string; bailleurTel: string; bailleurTelBrut: string;
  locNom: string; locTel: string; echeance: string; erreur?: string;
};

export default function PaiementLocataire({ d }: { d: DonneesPaiement }) {`,
  ({ all, re }) => {
    all("Appartement Ouakam 2", "{d.bienNom}");
    all("Immeuble Teranga, Ouakam • Dakar", "{d.bienLieu}");
    all("05 Octobre 2026", "{d.echeance}");
    all("Octobre 2026", "{d.moisLabel}");
    all(">150 000</span>", ">{d.montant}</span>");
    all("150 000 FCFA", "{d.montant} FCFA");
    all("Awa Diallo (+221 77 452 89 12)", "{d.locNom} ({d.locTel})");
    all("Bailleur Moussa Diop (+221 77 123 45 67)", "Bailleur {d.bailleur} ({d.bailleurTel})");
    all("Moussa Diop", "{d.bailleur}");
    all("MD\n            </div>", "{d.bailleurInit}\n            </div>");
    all('href="https://wa.me/221771234567"', `href={${lien}}`);
    re(/style=\{\{ backgroundImage:[^}]*\}\}/, 'data-fond="1"');
    all("bg-cover bg-center w-full h-full", "bg-gradient-to-br from-primary-container to-primary w-full h-full");
    all('id="wave-pay-btn" type="button"', 'id="wave-pay-btn" name="canal" value="WAVE" type="submit"');
    all('id="om-pay-btn" type="button"', 'id="om-pay-btn" name="canal" value="ORANGE_MONEY" type="submit"');
    all('<div className="space-y-3 mb-5">', '<form action={initierPaiement} className="space-y-3 mb-5">\n      <input type="hidden" name="jeton" value={d.jeton} />');
    re(/<\/button>\s*<\/div>\s*<div className="hidden rounded-xl/, '</button>\n      </form>\n      <div className="hidden rounded-xl');
    all('<div className="flex flex-col w-full px-margin pb-12 pt-2">', '<div className="flex flex-col w-full px-margin pb-12 pt-2">\n      {d.erreur && <p role="alert" className="mb-3 rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{d.erreur}</p>}');
    all("Accès instantané 1-clic via WhatsApp • Sans création de compte", "Paiement sécurisé • Sans création de compte");
    all("Le compte du bailleur {d.bailleur} est crédité instantanément. Téléchargement PDF de la quittance disponible immédiatement après paiement.", "Le paiement est enregistré dès sa validation par l'opérateur. Le téléchargement PDF de la quittance est disponible immédiatement après.");
  },
);
{
  let s = readFileSync("src/components/PaiementLocataire.tsx", "utf8");
  s = 'import { initierPaiement } from "@/app/actions/paiement-locataire";\n\n' + s;
  writeFileSync("src/components/PaiementLocataire.tsx", s);
}

patch(
  "src/ports/Confirmation.tsx",
  "src/components/ConfirmationPaiement.tsx",
  "Confirmation",
  `export type DonneesConfirmation = {
  jetonQr: string; bailleur: string; bailleurInit: string; bailleurTelBrut: string;
  locNom: string; locTel: string; locInit: string; bienNom: string; bienLieu: string;
  periode: string; plage: string; loyer: string; total: string; solde: string; complet: boolean;
  canal: string; dateHeure: string; dateCourte: string; reference: string; numero: string;
};

export default function ConfirmationPaiement({ d }: { d: DonneesConfirmation }) {`,
  ({ all, re }) => {
    all("Certifié conforme Wave Sénégal", "Paiement sécurisé");
    all("Quittance officielle générée immédiatement pour Moussa Diop.", "Quittance officielle générée immédiatement pour {d.bailleur}.");
    all("Loyer réglé avec succès !", "{d.complet ? \"Loyer réglé avec succès !\" : \"Paiement reçu, merci !\"}");
    all(">150 000</span>", ">{d.total}</span>");
    all("Acquitté à 100% • Solde : 0 FCFA", "{d.solde}");
    all("08 Oct 2026 • 10:04", "{d.dateHeure}");
    all("Wave Direct", "{d.canal}");
    all("NUUF-TX-202610-88492", "{d.reference}");
    all("N° QUIT-2026-10-OKM", "N° {d.numero}");
    all("Conforme Art. 570 COCC Sénégal", "Conforme COCC Sénégal");
    all(">Moussa Diop</span>", ">{d.bailleur}</span>");
    all("MD\n", "{d.bailleurInit}\n");
    all(">Dakar, Sénégal</span>", ">Bailleur</span>");
    all(">Awa Diallo</span>", ">{d.locNom}</span>");
    all(">+221 77 452 89 12</span>", ">{d.locTel}</span>");
    all("AD\n", "{d.locInit}\n");
    all("Appartement Ouakam – Appt 2", "{d.bienNom}");
    all("Immeuble Teranga, Ouakam, Dakar", "{d.bienLieu}");
    all("Loyer Octobre 2026", "Loyer {d.periode}");
    all("01/10 au 31/10/2026", "{d.plage}");
    all(">150 000 FCFA</span>", ">{d.total} FCFA</span>");
    all("Nuuf Immo Dakar", "{d.bailleur}");
    all("08/10/2026 • 10:04", "{d.dateCourte}");
    all("Question pour Moussa Diop ?", "Question pour {d.bailleur} ?");
    all("Transmission automatique terminée", "Quittance disponible");
    all("Une copie PDF horodatée a été envoyée sur votre compte WhatsApp et dans votre boîte e-mail Nuuf.", "Conservez cette page : vous pouvez télécharger votre quittance à tout moment avec ce lien.");
    all("Retour à mon tableau de bord", "Vérifier cette quittance");
    all("{d.total} FCFA</span>", "{d.total} FCFA</span>");
  },
);
console.log("fait");
