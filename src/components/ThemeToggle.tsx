"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

type Choix = "auto" | "light" | "dark";
const CLE = "nuuf_theme";
const SUITE: Record<Choix, Choix> = { auto: "light", light: "dark", dark: "auto" };
const ICONE: Record<Choix, string> = { auto: "contrast", light: "light_mode", dark: "dark_mode" };

function appliquer(c: Choix) {
  const r = document.documentElement;
  if (c === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", c);
}

/** Thème : automatique (réglage de l'appareil) → clair → sombre. Le choix est mémorisé sur l'appareil. */
export default function ThemeToggle() {
  const { t } = useT();
  const libelles: Record<Choix, string> = { auto: t("automatique"), light: t("clair"), dark: t("sombre") };
  const titre = t("Thème");
  const [choix, setChoix] = useState<Choix>("auto");
  useEffect(() => {
    try {
      const v = localStorage.getItem(CLE);
      if (v === "light" || v === "dark") setChoix(v);
    } catch {}
  }, []);
  function suivant() {
    const n = SUITE[choix];
    setChoix(n);
    appliquer(n);
    try {
      if (n === "auto") localStorage.removeItem(CLE);
      else localStorage.setItem(CLE, n);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={suivant}
      aria-label={`${titre} : ${libelles[choix]}`}
      title={`${titre} : ${libelles[choix]}`}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
    >
      <span className="material-symbols-outlined text-[22px]">{ICONE[choix]}</span>
    </button>
  );
}
