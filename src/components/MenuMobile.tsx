"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LangueSwitch from "@/components/LangueSwitch";
import { useT } from "@/lib/i18n/client";

/** Menu des écrans étroits : liens du site, connexion et langue (le bouton « hamburger » n'existe qu'en dessous de 768 px). */
export default function MenuMobile({ liens }: { liens: { href: string; label: string }[] }) {
  const { t } = useT();
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, [ouvert]);

  const lien = "flex items-center h-12 px-space-md rounded-xl font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low";
  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-controls="menu-public"
        aria-label={ouvert ? t("Fermer le menu") : t("Ouvrir le menu")}
        className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-[26px]">{ouvert ? "close" : "menu"}</span>
      </button>
      {ouvert && (
        <>
          <button type="button" tabIndex={-1} aria-hidden onClick={() => setOuvert(false)} className="fixed inset-0 top-16 bg-on-surface/30 cursor-default" />
          <nav id="menu-public" aria-label={t("Menu")} className="absolute left-0 right-0 top-full bg-surface shadow-lg border-t border-outline-variant/40 p-space-md flex flex-col gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            {liens.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOuvert(false)} className={lien}>
                {l.label}
              </Link>
            ))}
            <Link href="/connexion" onClick={() => setOuvert(false)} className={`${lien} text-primary font-bold`}>
              <span className="material-symbols-outlined text-[20px] mr-2">login</span>
              {t("Se connecter")}
            </Link>
            <div className="sm:hidden flex items-center justify-between px-space-md pt-space-sm mt-1 border-t border-outline-variant/40">
              <span className="font-label-md text-label-md text-on-surface-variant">{t("Langue")}</span>
              <LangueSwitch />
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
