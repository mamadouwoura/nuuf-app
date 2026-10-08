"use client";

import { useEffect, useState } from "react";
import { renvoyerCode, verifierCodeForm } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

export default function OtpForm({ erreur, devCode }: { erreur?: string; devCode?: string | null }) {
  const { t } = useT();
  const [code, setCode] = useState("");
  const [reste, setReste] = useState(60);
  useEffect(() => {
    const t = setInterval(() => setReste((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(reste / 60)).padStart(2, "0");
  const ss = String(reste % 60).padStart(2, "0");
  const champs = (f: HTMLElement) => Array.from(f.closest("form")!.querySelectorAll<HTMLInputElement>(".otp-field"));

  function onInput(e: React.FormEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement;
    if (!t.classList.contains("otp-field")) return;
    t.value = t.value.replace(/D/g, "").slice(-1);
    const all = champs(t);
    setCode(all.map((i) => i.value).join(""));
    if (t.value) all[Math.min(all.indexOf(t) + 1, all.length - 1)].focus();
  }
  async function coller(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      const texte = (await navigator.clipboard.readText()).replace(/D/g, "").slice(0, 6);
      const champs = Array.from(e.currentTarget.closest("form")!.querySelectorAll<HTMLInputElement>(".otp-field"));
      champs.forEach((c, i) => (c.value = texte[i] ?? ""));
      setCode(champs.map((c) => c.value).join(""));
      champs[Math.min(texte.length, champs.length - 1)]?.focus();
    } catch {
      /* presse-papiers refusé : l'utilisateur saisit le code à la main */
    }
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement;
    if (e.key === "Backspace" && t.classList.contains("otp-field") && !t.value) {
      const all = champs(t);
      all[Math.max(all.indexOf(t) - 1, 0)].focus();
    }
  }

  return (
    <>
      {devCode && (
        <p className="mb-4 rounded-xl bg-secondary-fixed text-on-secondary-fixed px-3 py-2 font-body-md text-body-md">
          {t("Mode développement : votre code est")} <strong>{devCode}</strong>
        </p>
      )}
      {erreur && (
        <p role="alert" className="mb-4 rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">
          {erreur}
        </p>
      )}
      <form action={verifierCodeForm} onInput={onInput} onKeyDown={onKeyDown} className="w-full flex flex-col items-center" id="otp-form">
      <input type="hidden" name="code" value={code} readOnly />
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
      <input autoFocus autoComplete="one-time-code" className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface-container text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all" data-index="0" inputMode="numeric" maxLength={1} type="text" />
      <input className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface-container text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all" data-index="1" inputMode="numeric" maxLength={1} type="text" />
      <input className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface-container text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all" data-index="2" inputMode="numeric" maxLength={1} type="text" />
      </div>
      <div className="w-2.5 h-0.5 rounded-full bg-outline-variant mx-0.5"></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
      <input className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-outline-variant" data-index="3" inputMode="numeric" maxLength={1} placeholder="•" type="text" />
      <input className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-outline-variant" data-index="4" inputMode="numeric" maxLength={1} placeholder="•" type="text" />
      <input className="otp-field w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-surface text-center font-display-currency text-display-currency-mobile text-primary font-bold focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-outline-variant" data-index="5" inputMode="numeric" maxLength={1} placeholder="•" type="text" />
      </div>
      </div>
      <div className="flex items-center justify-between w-full max-w-xs mb-8 text-on-surface-variant font-label-md text-label-md">
      <span className="inline-flex items-center gap-1 text-primary">
      <span className="material-symbols-outlined text-sm">content_paste</span>
      <span>{t("Collez le code reçu")}</span>
      </span>
      <button className="font-semibold text-primary hover:underline" id="paste-btn" type="button" onClick={coller}>{t("Coller")}</button>
      </div>
      <button className="w-full h-13 py-3.5 px-6 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all" type="submit">
      <span>{t("Valider le numéro et continuer")}</span>
      <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
      <div className="flex items-center justify-between w-full mt-6 pt-6 border-t-0 bg-surface-container-low/40 rounded-2xl p-4">
      <div className="flex items-center gap-2">
      <div className="relative w-7 h-7 flex items-center justify-center">
      <svg className="w-7 h-7 -rotate-90 text-surface-container-highest" viewBox="0 0 36 36">
      <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="100, 100" strokeWidth="3"></path>
      </svg>
      <svg className="w-7 h-7 -rotate-90 text-primary absolute inset-0" viewBox="0 0 36 36">
      <path className="stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" id="timer-progress" strokeDasharray={`${Math.round((reste / 60) * 100)}, 100`} strokeLinecap="round" strokeWidth="3"></path>
      </svg>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Code non reçu ?")}</span>
      </div>
      <div className="flex items-center gap-3">
      <span className="font-label-md text-label-md font-bold text-on-surface" id="timer-text">{mm}:{ss}</span>
      <button className={`font-label-md text-label-md font-semibold ${reste > 0 ? "text-outline cursor-not-allowed" : "text-primary hover:underline"}`} disabled={reste > 0} formAction={renvoyerCode} formNoValidate id="resend-btn" type="submit" onClick={() => setTimeout(() => setReste(60), 0)}>{t("Renvoyer")}</button>
      </div>
      </div>
      </form>
    </>
  );
}
