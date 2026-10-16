import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { MODULES } from "@/lib/permissions";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Accès refusé")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { t } = await getT();
  const { module } = await searchParams;
  const m = MODULES.find((x) => x.code === module);
  return (
    <div className="flex flex-col items-center text-center gap-space-md max-w-md mx-auto py-space-xl">
      <span className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px]">lock</span>
      </span>
      <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t("Accès refusé")}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {m
          ? t("Votre accès ne comprend pas « {module} ». Demandez au propriétaire du compte de vous l'ouvrir.", { module: t(m.libelle) })
          : t("Votre accès ne comprend pas cette section. Demandez au propriétaire du compte de vous l'ouvrir.")}
      </p>
      <Link href="/tableau-de-bord" className="inline-flex items-center gap-2 h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
        {t("Retour au tableau de bord")}
      </Link>
    </div>
  );
}

export default function Page(props: { searchParams: Promise<{ module?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
