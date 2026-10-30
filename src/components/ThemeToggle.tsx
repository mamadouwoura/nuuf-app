"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/client";

type Theme = "light" | "dark";
const CLE = "nuuf_theme";

const abonnes = new Set<() => void>();
/** Thème réellement affiché : le choix mémorisé, sinon le mode clair (le réglage de l'appareil n'impose pas le sombre). */
function lire(): Theme {
  try {
    const v = localStorage.getItem(CLE);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "light";
}
function sAbonner(rappel: () => void) {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
  };
}
function choisir(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(CLE, theme);
  } catch {}
  abonnes.forEach((f) => f());
}

/** Un seul clic : bascule entre le mode clair et le mode sombre. Le choix est mémorisé sur l'appareil. */
export default function ThemeToggle({ ligne = false }: { ligne?: boolean }) {
  const { t } = useT();
  const theme = useSyncExternalStore(sAbonner, lire, () => "light" as Theme);
  const suivant: Theme = theme === "dark" ? "light" : "dark";
  const titre = suivant === "dark" ? t("Passer en mode sombre") : t("Passer en mode clair");
  if (ligne) {
    return (
      <button
        type="button"
        onClick={() => choisir(suivant)}
        className="flex h-12 w-full items-center gap-3 rounded-xl px-space-md text-left font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low"
      >
        <span className="material-symbols-outlined text-[22px] text-primary">{suivant === "dark" ? "dark_mode" : "light_mode"}</span>
        {titre}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => choisir(suivant)}
      aria-label={titre}
      title={titre}
      className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
    >
      <span className="material-symbols-outlined text-[22px]">{suivant === "dark" ? "dark_mode" : "light_mode"}</span>
    </button>
  );
}
