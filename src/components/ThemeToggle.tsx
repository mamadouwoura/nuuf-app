"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/client";

type Theme = "light" | "dark";
const CLE = "nuuf_theme";

const abonnes = new Set<() => void>();
const systemeSombre = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;

/** Thème réellement affiché : le choix mémorisé, sinon le réglage de l'appareil. */
function lire(): Theme {
  try {
    const v = localStorage.getItem(CLE);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return systemeSombre() ? "dark" : "light";
}
function sAbonner(rappel: () => void) {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
    mq.removeEventListener("change", rappel);
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
export default function ThemeToggle() {
  const { t } = useT();
  const theme = useSyncExternalStore(sAbonner, lire, () => "light" as Theme);
  const suivant: Theme = theme === "dark" ? "light" : "dark";
  const titre = suivant === "dark" ? t("Passer en mode sombre") : t("Passer en mode clair");
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
