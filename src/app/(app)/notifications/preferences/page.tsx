import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ActiverPush from "@/components/ActiverPush";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { clePubliquePush } from "@/lib/push";
import { majPreferences } from "@/app/actions/notifications";
import { CATEGORIES, categoriesCoupees } from "@/lib/notifications";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Préférences de notifications")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { t } = await getT();
  const { ok } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const coupees = await categoriesCoupees(user.id);

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-2xl">
      <div>
        <Link href="/notifications" className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("Notifications")}
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Préférences de notifications")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Choisissez ce pour quoi vous voulez être prévenu. Les alertes d'abonnement restent toujours actives.")}</p>
      </div>
      <ActiverPush clePublique={clePubliquePush()} />
      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{ok}</p>}
      <form action={majPreferences} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        {CATEGORIES.map((c) => (
          <label key={c.code} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
            <span className="material-symbols-outlined text-primary text-[22px]">{c.icone}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-label-lg text-label-lg text-on-surface font-semibold">{t(c.libelle)}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant">{t(c.aide)}</span>
            </span>
            <input type="checkbox" name={`cat_${c.code}`} defaultChecked={!coupees.has(c.code)} className="w-5 h-5 accent-primary" />
          </label>
        ))}
        <BoutonEnvoi enCours={t("Enregistrement…")} className="self-start h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold mt-2">
          {t("Enregistrer")}
        </BoutonEnvoi>
      </form>
    </div>
  );
}

export default function Page(props: { searchParams: Promise<{ ok?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
