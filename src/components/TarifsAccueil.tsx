"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

export type PlanAffiche = {
  code: string;
  nom: string;
  pour: string;
  logements: string;
  vedette: boolean;
  points: string[];
  prixMensuel: string;
  prixAnnuel: string;
  note?: string;
};

/** Grille des formules de l'accueil, avec bascule mensuel / annuel sans rechargement. Textes et prix arrivent déjà traduits et formatés. */
export default function TarifsAccueil({ plans }: { plans: PlanAffiche[] }) {
  const { t } = useT();
  const [annuel, setAnnuel] = useState(false);
  const onglet = (actif: boolean) => `px-4 py-2 rounded-full font-label-lg text-label-lg transition-colors ${actif ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="mx-auto flex items-center gap-1 p-1 rounded-full bg-surface-container-lowest" role="group" aria-label={t("Périodicité de facturation")}>
        <button type="button" onClick={() => setAnnuel(false)} aria-pressed={!annuel} className={onglet(!annuel)}>{t("Mensuel")}</button>
        <button type="button" onClick={() => setAnnuel(true)} aria-pressed={annuel} className={onglet(annuel)}>{t("Annuel • 2 mois offerts")}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-stretch">
        {plans.map((p) => (
          <div key={p.code} className={`relative rounded-2xl bg-surface-container-lowest p-space-lg flex flex-col gap-space-md ${p.vedette ? "ring-2 ring-primary-container shadow-lg" : "shadow-sm"}`}>
            {p.vedette && <span className="absolute -top-3 left-space-lg px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">{t("Le plus choisi")}</span>}
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{p.nom}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{p.pour}</p>
              <p className="font-label-lg text-label-lg text-primary font-semibold mt-1">{p.logements}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-currency text-display-currency text-primary">{annuel ? p.prixAnnuel : p.prixMensuel}</span>
              <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA / {annuel ? t("an") : t("mois")}</span>
            </div>
            {p.note && <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">{p.note}</p>}
            <ul className="flex flex-col gap-2 flex-1">
              {p.points.map((x) => (
                <li key={x} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                  {x}
                </li>
              ))}
            </ul>
            <Link href="/inscription" className={`h-12 rounded-xl flex items-center justify-center font-label-lg text-label-lg font-bold ${p.vedette ? "bg-primary-container text-on-primary hover:bg-primary" : "bg-surface-container text-primary hover:bg-surface-container-high"}`}>
              {t("Essayer 14 jours")}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center font-body-md text-body-md text-on-surface-variant">
        {t("14 jours d'essai gratuit, sans carte bancaire. Sans engagement. Aucun pourcentage n'est prélevé sur vos loyers.")}{" "}
        <Link href="/tarifs" className="font-semibold text-primary underline underline-offset-4">{t("Comparer les formules en détail")}</Link>
      </p>
    </div>
  );
}
