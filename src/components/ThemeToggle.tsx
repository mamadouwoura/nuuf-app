"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/client";

type Choix = "auto" | "light" | "dark";
const CLE = "nuuf_theme";
const SUITE: Record<Choix, Choix> = { auto: "light", light: "dark", dark: "auto" };
const ICONE: Record<Choix, string> = { auto: "contrast", light: "light_mode", dark: "dark_mode" };

const abonnes = new Set<() => void>();
function lire(): Choix {
  try {
    const v = localStorage.getItem(CLE);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}
function sAbonner(rappel: () => void) {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
  };
}
function choisir(c: Choix) {
  const r = document.documentElement;
  if (c === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", c);
  try {
    if (c === "auto") localStorage.removeItem(CLE);
    else localStorage.setItem(CLE, c);
  } catch {}
  abonnes.forEach((f) => f());
}

/** Thème : automatique (réglage de l'appareil) → clair → sombre. Le choix est mémorisé sur l'appareil. */
export default function ThemeToggle() {
  const { t } = useT();
  const choix = useSyncExternalStore(sAbonner, lire, () => "auto" as Choix);
  const libelles: Record<Choix, string> = { auto: t("automatique"), light: t("clair"), dark: t("sombre") };
  const titre = `${t("Thème")} : ${libelles[choix]}`;
  return (
    <button
      type="button"
      onClick={() => choisir(SUITE[choix])}
      aria-label={titre}
      title={titre}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
    >
      <span className="material-symbols-outlined text-[22px]">{ICONE[choix]}</span>
    </button>
  );
}
