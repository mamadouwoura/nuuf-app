"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";

/** Filet de sécurité : une panne (base de données, réseau…) n'affiche jamais de détail technique. */
export default function Erreur({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useT();
  return (
    <main className="min-h-screen flex items-center justify-center p-space-md bg-surface">
      <div role="alert" className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-xl text-center flex flex-col items-center gap-space-sm">
        <span className="material-symbols-outlined text-[48px] text-secondary">cloud_off</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t("Un petit souci de notre côté")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("Le service est momentanément indisponible. Vos données sont en sécurité. Réessayez dans un instant.")}
        </p>
        <div className="flex flex-wrap justify-center gap-space-sm mt-space-sm">
          <button onClick={() => reset()} className="h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors">
            {t("Réessayer")}
          </button>
          <Link href="/" className="inline-flex items-center h-12 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high transition-colors">
            {t("Accueil")}
          </Link>
        </div>
      </div>
    </main>
  );
}
