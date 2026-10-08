import { Suspense } from "react";
import AjouterBienForm from "@/components/AjouterBienForm";

export const metadata = { title: "Ajouter un bien" };

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
