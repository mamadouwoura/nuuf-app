"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";

/** Bouton « œil » : affiche ou masque le mot de passe d'un champ identifié par son id. */
export default function VoirMotDePasse({ cible, className }: { cible: string; className?: string }) {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  return (
    <button
      type="button"
      className={className}
      aria-label={visible ? t("Masquer le mot de passe") : t("Afficher le mot de passe")}
      aria-pressed={visible}
      onClick={() => {
        const champ = document.getElementById(cible) as HTMLInputElement | null;
        if (!champ) return;
        champ.type = visible ? "password" : "text";
        setVisible(!visible);
      }}
    >
      <span className="material-symbols-outlined text-lg">{visible ? "visibility_off" : "visibility"}</span>
    </button>
  );
}
