"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { creerTraducteur, type Dictionnaire, type Traducteur } from "./translate";

const Contexte = createContext<Traducteur>(creerTraducteur("fr"));

/** Fournit la langue et le dictionnaire aux composants client. */
export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionnaire; children: ReactNode }) {
  const valeur = useMemo(() => creerTraducteur(locale, dict), [locale, dict]);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Traducteur d'un composant client : `const { t, tn, locale } = useT();` */
export const useT = () => useContext(Contexte);
export const useLocale = (): Locale => useContext(Contexte).locale;
