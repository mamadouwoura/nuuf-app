"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { changerLangue } from "@/app/actions/langue";
import { LOCALES } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";

const NOMS: Record<string, string> = { fr: "Français", en: "English" };

/** Sélecteur de langue : une pastille par langue, la langue active est mise en évidence. */
export default function LangueSwitch() {
  const { locale, t } = useT();
  const router = useRouter();
  const [attente, demarrer] = useTransition();
  return (
    <div role="group" aria-label={t("Langue")} className="flex items-center rounded-xl bg-surface-container p-0.5" aria-busy={attente}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          aria-label={NOMS[l]}
          title={NOMS[l]}
          disabled={attente}
          onClick={() => demarrer(async () => { await changerLangue(l); router.refresh(); })}
          className={`h-9 min-w-9 px-2 rounded-[10px] font-label-md text-label-md font-bold uppercase transition-colors ${
            l === locale ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
