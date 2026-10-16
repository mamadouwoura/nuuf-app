"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";

/** Affiche un lien dans un champ en lecture seule, avec un bouton pour le copier. */
export default function CopierLien({ lien }: { lien: string }) {
  const { t } = useT();
  const [copie, setCopie] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        readOnly
        value={lien}
        aria-label={t("Lien d'invitation")}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 min-w-0 h-11 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(lien);
            setCopie(true);
            setTimeout(() => setCopie(false), 2000);
          } catch {
            /* presse-papiers indisponible : le champ reste sélectionnable à la main */
          }
        }}
        className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold inline-flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">{copie ? "check" : "content_copy"}</span>
        {copie ? t("Copié") : t("Copier")}
      </button>
    </div>
  );
}
