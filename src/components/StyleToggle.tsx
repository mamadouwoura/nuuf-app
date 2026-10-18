"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/client";

type Style = "classique" | "papier";
const CLE = "nuuf_style";

const abonnes = new Set<() => void>();

/** Style réellement affiché : le choix mémorisé sur l'appareil, sinon le style Papier (par défaut). */
function lire(): Style {
  try {
    if (localStorage.getItem(CLE) === "classique") return "classique";
  } catch {}
  return "papier";
}
function sAbonner(rappel: () => void) {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
  };
}
function choisir(style: Style) {
  if (style === "papier") document.documentElement.setAttribute("data-style", "papier");
  else document.documentElement.removeAttribute("data-style");
  try {
    localStorage.setItem(CLE, style);
  } catch {}
  abonnes.forEach((f) => f());
}

/** Bascule entre le style « Papier » (par défaut) et l'ancien style classique. Mémorisé sur l'appareil, sans effet sur les autres comptes. */
export default function StyleToggle() {
  const { t } = useT();
  const style = useSyncExternalStore(sAbonner, lire, () => "papier" as Style);
  const suivant: Style = style === "papier" ? "classique" : "papier";
  const titre = suivant === "papier" ? t("Essayer le style Papier") : t("Revenir au style classique");
  return (
    <button
      type="button"
      onClick={() => choisir(suivant)}
      aria-label={titre}
      aria-pressed={style === "papier"}
      title={titre}
      className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
    >
      <span className="material-symbols-outlined text-[22px]" style={style === "papier" ? { fontVariationSettings: "'FILL' 1" } : undefined}>palette</span>
    </button>
  );
}
