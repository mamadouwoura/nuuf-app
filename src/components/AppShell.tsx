"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";
import { N_ } from "@/lib/i18n/translate";
import LangueSwitch from "@/components/LangueSwitch";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/tableau-de-bord", icon: "grid_view", label: N_("Tableau de bord") },
  { href: "/biens", icon: "apartment", label: N_("Biens"), badge: "biens" },
  { href: "/locataires", icon: "group", label: N_("Locataires") },
  { href: "/proprietaires", icon: "badge", label: N_("Propriétaires") },
  { href: "/bilans", icon: "summarize", label: N_("Bilans du mois") },
  { href: "/historique", icon: "manage_search", label: N_("Vérifier un candidat") },
  { href: "/paiements", icon: "account_balance_wallet", label: N_("Paiements") },
  { href: "/relances", icon: "schedule", label: N_("Relances"), badge: "retards", alert: true },
  { href: "/quittances", icon: "receipt_long", label: N_("Quittances") },
  { href: "/parametres", icon: "tune", label: N_("Paramètres") },
];

const CONTACT_WA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;

const BARRE = [
  { href: "/tableau-de-bord", icon: "grid_view", label: N_("Accueil") },
  { href: "/biens", icon: "apartment", label: N_("Biens") },
  { href: "/paiements", icon: "account_balance_wallet", label: N_("Paiements") },
  { href: "/quittances", icon: "receipt_long", label: N_("Quittances") },
];
const PLUS = [
  { href: "/locataires", icon: "group", label: N_("Locataires") },
  { href: "/proprietaires", icon: "badge", label: N_("Propriétaires") },
  { href: "/bilans", icon: "summarize", label: N_("Bilans du mois") },
  { href: "/historique", icon: "manage_search", label: N_("Vérifier un candidat") },
  { href: "/relances", icon: "schedule", label: N_("Relances") },
  { href: "/parametres", icon: "tune", label: N_("Paramètres") },
  { href: "/parametres/abonnement", icon: "workspace_premium", label: N_("Abonnement") },
];

const ACTIVE = "bg-primary-container text-on-primary font-bold shadow-sm rounded-xl";
const IDLE =
  "rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

export default function AppShell({
  children,
  nom,
  libelleCompte,
  nbBiens,
  nbRetards,
  bandeau,
  moisLabel,
  simulation,
  }: {
  children: React.ReactNode;
  nom: string;
  libelleCompte: string;
  nbBiens: number;
  nbRetards: number;
  bandeau: { ton: "info" | "alerte"; texte: string } | null;
  moisLabel: string;
  simulation: boolean;
}) {
  const { t, tn } = useT();
  const pathname = usePathname();
  const navigation = NAV;
  const plusLiens = PLUS;
  const [plus, setPlus] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex-col justify-between overflow-y-auto">
        <div className="flex flex-col">
          <div className="px-space-lg pt-space-lg pb-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-primary">nuuf</span>
            </div>
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">{t("Gestion locative & Loyers")}</p>
          </div>
          <nav className="flex flex-col gap-1 px-space-md mt-space-sm">
            {navigation.map((n) => {
              const valeur = n.badge === "biens" ? nbBiens : n.badge === "retards" ? nbRetards : 0;
              const actif = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={actif ? "page" : undefined}
                  className={`flex items-center justify-between px-space-md py-space-sm transition-all group ${actif ? ACTIVE : IDLE}`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
                    <span className="font-label-lg text-label-lg">{t(n.label)}</span>
                  </div>
                  {actif && !(n.badge && valeur > 0) && <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>}
                  {n.badge && valeur > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-md text-label-md ${
                        n.alert
                          ? "bg-error-container text-on-error-container font-bold"
                          : actif
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {valeur}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-space-md m-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className={`w-2 h-2 rounded-full ${simulation ? "bg-secondary-container" : "bg-primary-container"}`}></span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{t("Wave & Orange Money")}</span>
            </div>
            
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{simulation ? t("Mode simulation • aucun débit réel") : t("Paiements actifs")}</p>
          <div className="pt-space-xs mt-space-xs flex items-center justify-between">
            {CONTACT_WA ? (
              <a className="flex items-center gap-1.5 font-label-md text-label-md text-primary font-semibold hover:text-primary-container transition-colors" href={`https://wa.me/${CONTACT_WA.replace(/\D/g, "")}`} target="_blank">
                <span className="material-symbols-outlined text-[16px]">chat</span>{t("Support WhatsApp")}
              </a>
            ) : (
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Support : écrivez-nous depuis le site")}</span>
            )}
          </div>
        </div>
      </aside>
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter lg:px-gutter-desktop">
          <span className="lg:hidden shrink-0 font-headline-md text-headline-md tracking-tight font-extrabold text-primary">nuuf</span>
          <form action="/biens" method="get" role="search" className="hidden lg:flex items-center gap-space-md flex-1 max-w-lg">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                name="q"
                aria-label={t("Rechercher un bien ou un locataire")}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder={t("Rechercher un bien ou un locataire...")}
                type="search"
              />
            </div>
            <Link href="/paiements" className="flex items-center gap-space-xs px-space-md h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
              <span className="font-label-md text-label-md font-semibold">{moisLabel}</span>
            </Link>
          </form>
          <div className="flex items-center gap-1 sm:gap-space-sm shrink-0">
            <div className="hidden sm:block"><LangueSwitch /></div>
            <ThemeToggle />
            <Link href="/relances" aria-label={nbRetards > 0 ? tn(nbRetards, "{n} loyer en retard", "{n} loyers en retard") : t("Aucune alerte")} className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {nbRetards > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface"></span>}
            </Link>
            <div className="flex items-center gap-space-sm pl-space-sm">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md">
                {nom.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{nom}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{libelleCompte}</span>
              </div>
              <button type="button" onClick={() => setConfirmer(true)} aria-label={t("Se déconnecter")} title={t("Se déconnecter")} className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-error transition-colors"><span className="material-symbols-outlined text-[22px]">logout</span></button>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 bg-surface px-gutter lg:px-gutter-desktop pb-28 lg:pb-space-xl flex-1">
          {bandeau && (
            <div
              className={`mb-space-md rounded-xl px-space-md py-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 font-body-md text-body-md ${
                bandeau.ton === "info" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-error-container text-on-error-container"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">{bandeau.ton === "info" ? "hourglass_top" : "warning"}</span>
                {bandeau.texte}
              </span>
              <Link href="/abonnement/forfait" className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container">
                {t("Choisir un forfait")}
              </Link>
            </div>
          )}
          <div className="flex flex-col w-full">{children}</div>
        </main>
      </div>
      <nav aria-label={t("Navigation principale")} className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container-low border-t border-outline-variant/40 pb-safe">
        <ul className="flex items-stretch justify-around">
          {BARRE.map((n) => {
            const actif = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <li key={n.href} className="flex-1">
                <Link href={n.href} className={`relative flex flex-col items-center gap-0.5 py-2 font-label-md text-[11px] ${actif ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                  <span className={`material-symbols-outlined text-[24px] ${actif ? "" : "opacity-80"}`} style={actif ? { fontVariationSettings: "'FILL' 1" } : undefined}>{n.icon}</span>
                  {t(n.label)}
                  </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button type="button" onClick={() => setPlus((v) => !v)} aria-expanded={plus} className={`relative w-full flex flex-col items-center gap-0.5 py-2 font-label-md text-[11px] ${plus ? "text-primary font-bold" : "text-on-surface-variant"}`}>
              <span className="material-symbols-outlined text-[24px]">menu</span>
              {t("Plus")}
              {nbRetards > 0 && <span className="absolute top-1 right-[28%] min-w-4 h-4 px-1 rounded-full bg-error text-on-error text-[10px] leading-4 text-center">{nbRetards}</span>}
            </button>
          </li>
        </ul>
        {plus && (
          <div className="absolute bottom-full inset-x-0 bg-surface-container-lowest border-t border-outline-variant/40 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] p-space-md flex flex-col gap-1">
            <div className="sm:hidden flex items-center justify-between px-space-md pb-1">
              <span className="font-label-md text-label-md text-on-surface-variant">{t("Langue")}</span>
              <LangueSwitch />
            </div>
            {plusLiens.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setPlus(false)} className="flex items-center gap-3 px-space-md py-3 rounded-xl text-on-surface hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[22px] text-primary">{n.icon}</span>
                <span className="font-label-lg text-label-lg">{t(n.label)}</span>
                {n.href === "/relances" && nbRetards > 0 && <span className="ml-auto px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">{nbRetards}</span>}
              </Link>
            ))}
            <button type="button" onClick={() => { setPlus(false); setConfirmer(true); }} className="w-full flex items-center gap-3 px-space-md py-3 rounded-xl text-error hover:bg-error-container/40">
              <span className="material-symbols-outlined text-[22px]">logout</span>
              <span className="font-label-lg text-label-lg">{t("Se déconnecter")}</span>
            </button>
          </div>
        )}
      </nav>

      {confirmer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 p-margin" role="dialog" aria-modal="true" aria-labelledby="titre-deconnexion" onClick={() => setConfirmer(false)} onKeyDown={(e) => e.key === "Escape" && setConfirmer(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-space-lg shadow-xl flex flex-col gap-space-md" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-deconnexion" className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Se déconnecter ?")}</h2>
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
