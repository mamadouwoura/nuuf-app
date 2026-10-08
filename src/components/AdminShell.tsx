"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { N_ } from "@/lib/i18n/translate";
import Preferences from "@/components/Preferences";

const NAV = [
  { href: "/admin", icon: "grid_view", label: N_("Vue d'ensemble"), exact: true },
  { href: "/admin/bailleurs", icon: "real_estate_agent", label: N_("Bailleurs") },
  { href: "/admin/abonnements", icon: "card_membership", label: N_("Abonnements") },
  { href: "/admin/paiements", icon: "payments", label: N_("Paiements") },
];

export default function AdminShell({ nom, simulation, children }: { nom: string; simulation: boolean; children: React.ReactNode }) {
  const { t } = useT();
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
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
            <Link href="/tableau-de-bord" className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="font-label-lg text-label-lg">{t("Retour à l'application")}</span>
            </Link>
          </nav>
        </div>
        <div className="p-space-md m-space-md rounded-xl bg-surface-container flex flex-col gap-1">
          <p className="font-label-md text-label-md font-semibold text-on-surface">{t("Passerelles de paiement")}</p>
          <p className={`font-body-sm text-body-sm ${simulation ? "text-secondary font-semibold" : "text-on-surface-variant"}`}>
            {simulation ? t("Mode simulation (aucun débit réel)") : t("Mode réel")}
          </p>
        </div>
      </aside>
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-desktop">
          <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide uppercase">{t("Administration Nuuf")}</span>
          <div className="flex items-center gap-space-sm">
            <Preferences />
            <div className="flex flex-col text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{nom}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{t("Super-Admin")}</span>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 bg-surface px-gutter-desktop pb-space-xl flex-1">
          <div className="flex flex-col w-full pt-space-md gap-space-lg">{children}</div>
        </main>
      </div>
    </>
  );
}
