import { Suspense } from "react";
import Screen, { bodyClass } from "@/ports/Connexion";
import { N_ } from "@/lib/i18n/translate";
import { getT } from "@/lib/i18n/server";
import Preferences from "@/components/Preferences";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Connexion")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  const { erreur, info } = await searchParams;
  return <Screen erreur={erreur} info={info} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  return (
    <div className={bodyClass}>
      <Preferences flottant />
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
