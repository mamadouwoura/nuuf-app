import { Suspense } from "react";
import AjouterBienForm from "@/components/AjouterBienForm";
import { N_ } from "@/lib/i18n/translate";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Ajouter un bien")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return <AjouterBienForm erreur={erreur} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
