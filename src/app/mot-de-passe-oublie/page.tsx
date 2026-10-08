import { Suspense } from "react";
import ReinitMotDePasse from "@/components/ReinitMotDePasse";
import { getDevOtp, lireJeton } from "@/lib/session";
import { telAffiche } from "@/lib/immo";

const fond = "bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary selection:text-on-primary";

async function Contenu({ searchParams }: { searchParams: Promise<{ etape?: string; erreur?: string }> }) {
  const { etape: demande, erreur } = await searchParams;
  // L'étape affichée dépend des jetons posés par les étapes précédentes, pas seulement de l'URL.
  const aEtape2 = Boolean(await lireJeton("nuuf_reinit"));
  const aEtape3 = Boolean(await lireJeton("nuuf_reinit_ok"));
  const etape: 1 | 2 | 3 = demande === "3" && aEtape3 ? 3 : demande === "2" && aEtape2 ? 2 : 1;
  const tel = await lireJeton("nuuf_reinit_tel");
  return (
    <ReinitMotDePasse
      etape={etape}
      erreur={erreur}
      telephone={tel ? telAffiche(tel) : "votre numéro"}
      devCode={etape === 2 ? await getDevOtp() : null}
    />
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ etape?: string; erreur?: string }> }) {
  return (
    <div className={fond}>
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
