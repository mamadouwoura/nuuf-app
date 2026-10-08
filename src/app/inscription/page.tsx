import { Suspense } from "react";
import Screen, { bodyClass } from "@/ports/Inscription";

export const metadata = { title: "Créer mon compte" };

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return <Screen erreur={erreur} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <div className={bodyClass}>
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
