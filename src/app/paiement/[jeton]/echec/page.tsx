import { Suspense } from "react";
import EcranEchec from "@/components/EcranEchec";
import { db } from "@/lib/db";
import { chargerParJeton } from "@/lib/public-paiement";

const fond = "bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen";
const CANAL = { WAVE: "Wave Sénégal", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { jeton } = await params;
  const { ref } = await searchParams;
  const c = await chargerParJeton(jeton);
  if (!c) return <EcranEchec variante="invalide" />;
  // La référence doit appartenir à CETTE échéance : un jeton valide ne donne pas accès aux paiements des autres.
  const p = ref ? await db.paiement.findFirst({ where: { referenceOperateur: ref, echeanceId: c.e.id } }) : null;
  return (
    <EcranEchec
      variante="echec"
      d={c.infos}
      jeton={jeton}
      detail={
        p
          ? {
              canal: CANAL[p.canal],
              date: p.creeLe.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) + " à " + p.creeLe.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              reference: p.referenceOperateur ?? "—",
            }
          : undefined
      }
    />
  );
}

export default function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ ref?: string }> }) {
  return (
    <div className={fond}>
      <Suspense fallback={null}>
        <Contenu {...props} />
      </Suspense>
    </div>
  );
}
