"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { deconnexion } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";
import { N_ } from "@/lib/i18n/translate";
import Preferences from "@/components/Preferences";

const NAV: { href: string; icon: string; label: string; court?: string; exact?: boolean }[] = [
  { href: "/admin", icon: "grid_view", label: N_("Vue d'ensemble"), court: N_("Accueil"), exact: true },
  { href: "/admin/bailleurs", icon: "real_estate_agent", label: N_("Bailleurs") },
  { href: "/admin/abonnements", icon: "card_membership", label: N_("Abonnements") },
  { href: "/admin/paiements", icon: "payments", label: N_("Paiements") },
];

export default function AdminShell({ nom, simulation, children }: { nom: string; simulation: boolean; children: React.ReactNode }) {
  const { t } = useT();
  const pathname = usePathname();
  const [confirmer, setConfirmer] = useState(false);
  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex-col justify-between overflow-y-auto">
        <div>
          <div className="px-space-lg pt-space-lg pb-space-md flex items-center gap-2">
            <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-primary">nuuf</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md">ops</span>
          </div>
          <div className="mx-space-md mb-space-md p-3 rounded-xl bg-surface-container flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">shield</span>
            <div>
              <p className="font-label-md text-label-md font-bold uppercase">{t("Accès restreint")}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Administration Nuuf")}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-space-md">
            {NAV.map((n) => {
              const actif = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all ${
                    actif ? "bg-primary-container text-on-primary font-bold shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
                  <span className="font-label-lg text-label-lg">{t(n.label)}</span>
                </Link>
              );
            })}
            <button type="button" onClick={() => setConfirmer(true)} className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-error hover:bg-error-container/40 transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-lg text-label-lg">{t("Se déconnecter")}</span>
            </button>
          </nav>
        </div>
        <div className="p-space-md m-space-md rounded-xl bg-surface-container flex flex-col gap-1">
          <p className="font-label-md text-label-md font-semibold text-on-surface">{t("Passerelles de paiement")}</p>
          <p className={`font-body-sm text-body-sm ${simulation ? "text-secondary font-semibold" : "text-on-surface-variant"}`}>
            {simulation ? t("Mode simulation (aucun débit réel)") : t("Mode réel")}
          </p>
        </div>
      </aside>
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter lg:px-gutter-desktop">
          <span className="lg:hidden flex items-center gap-2 shrink-0">
            <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-primary">nuuf</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-md text-label-md">ops</span>
          </span>
          <span className="hidden lg:inline font-label-lg text-label-lg text-on-surface font-semibold tracking-wide uppercase">{t("Administration Nuuf")}</span>
          <div className="flex items-center gap-space-sm">
            <Preferences />
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{nom}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{t("Super-Admin")}</span>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 bg-surface px-gutter lg:px-gutter-desktop pb-24 lg:pb-space-xl flex-1 min-w-0">
          <div className="flex flex-col w-full pt-space-md gap-space-lg">{children}</div>
        </main>
      </div>
      <nav aria-label={t("Navigation principale")} className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container-low border-t border-outline-variant/40 pb-safe">
        <ul className="flex items-stretch justify-around">
          {NAV.map((n) => {
            const actif = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <li key={n.href} className="flex-1">
                <Link href={n.href} className={`flex flex-col items-center gap-0.5 py-2 font-label-md text-[11px] ${actif ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                  <span className={`material-symbols-outlined text-[24px] ${actif ? "" : "opacity-80"}`} style={actif ? { fontVariationSettings: "'FILL' 1" } : undefined}>{n.icon}</span>
                  {t(n.court ?? n.label)}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button type="button" onClick={() => setConfirmer(true)} className="w-full flex flex-col items-center gap-0.5 py-2 font-label-md text-[11px] text-error">
              <span className="material-symbols-outlined text-[24px]">logout</span>
              {t("Quitter")}
            </button>
          </li>
        </ul>
      </nav>

      {confirmer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 p-margin" role="dialog" aria-modal="true" aria-labelledby="titre-deconnexion-admin" onClick={() => setConfirmer(false)} onKeyDown={(e) => e.key === "Escape" && setConfirmer(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-space-lg shadow-xl flex flex-col gap-space-md" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-deconnexion-admin" className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Se déconnecter ?")}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{t("Vous devrez saisir à nouveau votre mot de passe et un code de vérification pour revenir.")}</p>
            <div className="flex gap-space-sm justify-end">
              <button type="button" autoFocus onClick={() => setConfirmer(false)} className="h-11 px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high">{t("Rester connecté")}</button>
              <form action={deconnexion}>
                <button className="h-11 px-space-md rounded-xl bg-error text-on-error font-label-lg text-label-lg font-bold hover:opacity-90">{t("Se déconnecter")}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
