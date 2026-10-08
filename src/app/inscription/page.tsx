import { Suspense } from "react";
import Screen, { bodyClass } from "@/ports/Inscription";
import { N_ } from "@/lib/i18n/translate";
import { getT } from "@/lib/i18n/server";
import Preferences from "@/components/Preferences";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Créer mon compte")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return <Screen erreur={erreur} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <div className={bodyClass}>
      <Preferences flottant />
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
