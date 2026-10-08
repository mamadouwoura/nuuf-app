import { Suspense } from "react";
import AjouterBienForm from "@/components/AjouterBienForm";

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
