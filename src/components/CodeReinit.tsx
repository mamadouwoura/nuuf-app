"use client";

import Link from "next/link";
import { useState } from "react";
import { verifierCodeReinit } from "@/app/actions/reinit";
import { useT } from "@/lib/i18n/client";

const CHAMP =
  "w-10 sm:w-12 h-12 sm:h-14 text-center font-display-currency text-[22px] font-bold rounded-lg bg-surface-container text-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-inner";

/** Six cases à un chiffre ; le code complet est envoyé dans le champ caché « code ». */
export default function CodeReinit() {
  const { t } = useT();
  const [code, setCode] = useState("");
  const champs = (el: HTMLElement) => Array.from(el.closest("form")!.querySelectorAll<HTMLInputElement>("input[data-case]"));

  function surSaisie(e: React.FormEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement;
    if (!("case" in t.dataset)) return;
    t.value = t.value.replace(/\D/g, "").slice(-1);
    const toutes = champs(t);
    setCode(toutes.map((i) => i.value).join(""));
    if (t.value) toutes[Math.min(toutes.indexOf(t) + 1, toutes.length - 1)].focus();
  }
  function surTouche(e: React.KeyboardEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement;
    if (e.key === "Backspace" && "case" in t.dataset && !t.value) {
      const toutes = champs(t);
      toutes[Math.max(toutes.indexOf(t) - 1, 0)].focus();
    }
  }
  const c = (i: number) => <input key={i} data-case="" inputMode="numeric" maxLength={1} type="text" className={CHAMP} aria-label={t("Chiffre {n}", { n: i + 1 })} />;

  return (
    <form action={verifierCodeReinit} onInput={surSaisie} onKeyDown={surTouche}>
      <input type="hidden" name="code" value={code} readOnly />
      <div className="mb-space-lg">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">{[0, 1, 2].map(c)}</div>
          <span className="text-outline-variant font-bold text-lg select-none px-0.5">–</span>
          <div className="flex items-center gap-1.5 sm:gap-2">{[3, 4, 5].map(c)}</div>
        </div>
        <div className="flex items-center justify-between mt-3 text-on-surface-variant font-body-sm text-body-sm">
          <Link href="/mot-de-passe-oublie" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>{t("Modifier le numéro")}</span>
          </Link>
          <div className="flex items-center gap-1 text-secondary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>{t("Valable 10 min")}</span>
          </div>
        </div>
      </div>
      <button
        disabled={code.length < 6}
        className="w-full flex items-center justify-center gap-2 py-3 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all active:scale-[0.99] shadow-md disabled:opacity-60"
        type="submit"
      >
        <span className="material-symbols-outlined text-[18px]">verified</span>
        <span>{t("Valider le code")}</span>
      </button>
    </form>
  );
}
