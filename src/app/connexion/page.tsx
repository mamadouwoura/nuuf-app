import { Suspense } from "react";
import Screen, { bodyClass } from "@/ports/Connexion";

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  const { erreur, info } = await searchParams;
  return <Screen erreur={erreur} info={info} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  return (
    <div className={bodyClass}>
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
