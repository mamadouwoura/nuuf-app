import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main className="min-h-screen flex items-center justify-center p-space-md bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-xl text-center flex flex-col items-center gap-space-sm">
        <span className="material-symbols-outlined text-[48px] text-primary">search_off</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t("Page introuvable")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Cette page n'existe pas ou vous n'y avez pas accès.")}</p>
        <Link href="/tableau-de-bord" className="mt-space-sm inline-flex items-center h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors">
          {t("Retour à l'accueil")}
        </Link>
      </div>
    </main>
  );
}
