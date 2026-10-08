import Link from "next/link";
import { Suspense } from "react";
import TableBailleurs from "@/components/TableBailleurs";
import { listerBailleurs, statsGlobales } from "@/lib/admin";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration")) };
}

const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: N_("Espèces"), VIREMENT: N_("Virement") } as const;

async function Contenu() {
  const { t, tn } = await getT();
  const [s, lignes] = await Promise.all([statsGlobales(), listerBailleurs()]);
  const totalCanaux = Object.values(s.parCanal).reduce((a, b) => a + b, 0);
  const carte = "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm";

  return (
    <>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Vue d'ensemble")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Supervision en direct de la plateforme Nuuf • bailleurs et transactions locatives.")}</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className={carte}>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Bailleurs inscrits")}</span>
          <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{s.inscrits}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{t("+{a} sur 30 jours • {b} logements gérés", { a: s.nouveaux30j, b: s.logementsTotal })}</span>
        </div>
        <div className={carte}>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Abonnés payants")}</span>
          <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{s.payants}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t("Conversion {taux} % • {b} Bailleur • {p} Pro • {a} Agence", { taux: s.conversion, b: s.parForfait.BAILLEUR, p: s.parForfait.PRO, a: s.parForfait.AGENCE })}
          </span>
        </div>
        <div className={carte}>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("MRR (revenu mensuel)")}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(s.mrr)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{t("ARR projeté {montant} FCFA", { montant: fcfa(s.mrr * 12) })}</span>
        </div>
        <div className={carte}>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Loyers traités (30 j)")}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(s.volume)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{tn(s.nbPaiements, "{n} paiement", "{n} paiements")} • {tn(s.echecs, "{n} échec", "{n} échecs")}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <div className={carte}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Pipeline")}</h2>
          {[
            [t("Payants"), s.payants, "bg-primary"],
            [t("Essais en cours"), s.essais, "bg-secondary-container"],
            [t("Expirés (non convertis)"), s.expires, "bg-error"],
          ].map(([l, n, c]) => (
            <div key={String(l)}>
              <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
                <span>{String(l)}</span>
                <span>{Number(n)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
                <div className={`h-full ${String(c)}`} style={{ width: `${s.inscrits ? (Number(n) / s.inscrits) * 100 : 0}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className={`${carte} lg:col-span-2`}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Volume par canal (30 jours)")}</h2>
          {totalCanaux === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun paiement sur la période.")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.entries(s.parCanal).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
                    <span>{t(CANAL[k as keyof typeof CANAL])}</span>
                    <span>{fcfa(v)} FCFA ({Math.round((v / totalCanaux) * 100)} %)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-primary-container" style={{ width: `${(v / totalCanaux) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-space-lg pb-0">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Derniers bailleurs inscrits")}</h2>
          <Link href="/admin/bailleurs" className="font-label-md text-label-md text-primary font-semibold hover:underline">{t("Voir tous")}</Link>
        </div>
        <TableBailleurs lignes={lignes.slice(0, 7)} />
      </section>
    </>
  );
}

export default async function Page() {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="font-body-md text-body-md">{t("Chargement…")}</p>}>
      <Contenu />
    </Suspense>
  );
}
