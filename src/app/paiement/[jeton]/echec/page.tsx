import { Suspense } from "react";
import EcranEchec from "@/components/EcranEchec";
import { db } from "@/lib/db";
import { chargerParJeton } from "@/lib/public-paiement";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";
import Preferences from "@/components/Preferences";

const fond = "bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen";
const CANAL = { WAVE: "Wave Sénégal", ORANGE_MONEY: "Orange Money", ESPECES: N_("Espèces"), VIREMENT: N_("Virement") } as const;

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { jeton } = await params;
  const { ref } = await searchParams;
  const { t, locale } = await getT();
  const c = await chargerParJeton(jeton, locale);
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
              canal: t(CANAL[p.canal]),
              date: formaterDate(p.creeLe, locale, { day: "2-digit", month: "short", year: "numeric" }) + ` ${t("à")} ` + formaterDate(p.creeLe, locale, { hour: "2-digit", minute: "2-digit" }),
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
      <Preferences flottant />
      <Suspense fallback={null}>
        <Contenu {...props} />
      </Suspense>
    </div>
  );
}
