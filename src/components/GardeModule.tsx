import { Suspense } from "react";
import Chargement from "@/components/Chargement";
import { exigerModule, type CodeModule } from "@/lib/permissions";

async function Verifier({ module, children }: { module: CodeModule; children: React.ReactNode }) {
  await exigerModule(module);
  return <>{children}</>;
}

/** Enveloppe d'une section : l'accès est vérifié avant d'afficher quoi que ce soit. */
export default function GardeModule({ module, children }: { module: CodeModule; children: React.ReactNode }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Verifier module={module}>{children}</Verifier>
    </Suspense>
  );
}
