"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

const CLE = "nuuf-tutoriel-vu";
export const EVENEMENT_TUTORIEL = "nuuf:tutoriel";

type Etape = { icone: string; titre: string; texte: string };

/** Visite guidée affichée à la première ouverture ; rejouable depuis les paramètres. */
export default function Tutoriel({ agence }: { agence: boolean }) {
  const { t } = useT();
  const [ouvert, setOuvert] = useState(false);
  const [i, setI] = useState(0);
  const suivant = useRef<HTMLButtonElement>(null);

  const etapes: Etape[] = [
    { icone: "waving_hand", titre: t("Bienvenue sur Nuuf"), texte: t("Un tour de 30 secondes pour savoir où trouver l'essentiel. Vous pourrez le revoir depuis les paramètres.") },
    { icone: "apartment", titre: t("Vos biens et vos locataires"), texte: t("Ajoutez un bien avec son locataire, puis remplissez sa fiche de renseignement : elle alimente le contrat et l'historique.") },
    { icone: "account_balance_wallet", titre: t("Encaisser et quittancer"), texte: t("Chaque loyer reçu (Wave, Orange Money ou espèces) donne une quittance numérotée avec QR code. Les relances partent sur WhatsApp.") },
    ...(agence
      ? [{ icone: "badge", titre: t("Propriétaires, bilans et trésorerie"), texte: t("Rattachez les biens à leur propriétaire, établissez le mandat, puis envoyez le bilan mensuel. La trésorerie suit vos entrées et vos dépenses.") }]
      : []),
    { icone: "monitoring", titre: t("Statistiques et notifications"), texte: t("Suivez le taux de recouvrement et les impayés par ancienneté. La cloche en haut à droite vous prévient de chaque événement important.") },
  ];

  const fermer = useCallback(() => {
    setOuvert(false);
    try {
      localStorage.setItem(CLE, "1");
    } catch {
      /* stockage indisponible : le tutoriel pourra se rouvrir */
    }
  }, []);

  useEffect(() => {
    let vu = false;
    try {
      vu = localStorage.getItem(CLE) === "1";
    } catch {
      vu = true; // sans stockage on ne l'impose pas à chaque page
    }
    // Différé d'un tick : l'ouverture n'est jamais déclenchée pendant le rendu initial.
    const minuteur = setTimeout(() => {
      if (!vu) {
        setI(0);
        setOuvert(true);
      }
    }, 0);
    const rouvrir = () => {
      setI(0);
      setOuvert(true);
    };
    window.addEventListener(EVENEMENT_TUTORIEL, rouvrir);
    return () => {
      clearTimeout(minuteur);
      window.removeEventListener(EVENEMENT_TUTORIEL, rouvrir);
    };
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    suivant.current?.focus();
    const touche = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [ouvert, i, fermer]);

  if (!ouvert) return null;
  const e = etapes[Math.min(i, etapes.length - 1)];
  const derniere = i >= etapes.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tuto-titre">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-2xl p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">{e.icone}</span>
          </span>
          <h2 id="tuto-titre" className="font-headline-sm text-headline-sm text-on-surface font-bold">{e.titre}</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">{e.texte}</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {etapes.map((_, k) => (
              <span key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-surface-container-high"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!derniere && (
              <button type="button" onClick={fermer} className="h-10 px-3 rounded-xl text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface-container">
                {t("Passer")}
              </button>
            )}
            <button
              ref={suivant}
              type="button"
              onClick={() => (derniere ? fermer() : setI(i + 1))}
              className="h-10 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold"
            >
              {derniere ? t("Commencer") : t("Suivant")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bouton qui relance la visite guidée. */
export function BoutonTutoriel({ libelle }: { libelle: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENEMENT_TUTORIEL))}
      className="self-start inline-flex items-center gap-2 h-11 px-space-lg rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-semibold"
    >
      <span className="material-symbols-outlined text-[20px]">school</span>
      {libelle}
    </button>
  );
}
