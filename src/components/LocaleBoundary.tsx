import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/client";
import { dictionnaireClient, getLocale } from "@/lib/i18n/server";

/** Détermine la langue de la requête et la met à disposition de tout l'arbre (composants client compris). */
export default async function LocaleBoundary({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <I18nProvider locale={locale} dict={dictionnaireClient(locale)}>
      {children}
    </I18nProvider>
  );
}
