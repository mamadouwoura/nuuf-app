import { Suspense } from "react";
import { notFound } from "next/navigation";
import { resultatSimulation } from "@/app/actions/paiement-locataire";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { modeSimulation } from "@/lib/passerelle";
import { getT } from "@/lib/i18n/server";

async function Contenu({ params }: { params: Promise<{ ref: string }> }) {
  const { t } = await getT();
  if (!modeSimulation()) notFound();
  const { ref } = await params;
  const p = await db.paiement.findUnique({ where: { referenceOperateur: ref } });
  const f = p ? null : await db.factureAbonnement.findUnique({ where: { referenceOperateur: ref } });
  if (!p && !f) notFound();
  const montant = p ? p.montant : f!.montant;
  const wave = p ? p.canal === "WAVE" : true;
  return (
    <main className="min-h-screen flex items-center justify-center p-space-md">
      <form action={resultatSimulation} className="max-w-sm w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
        <input type="hidden" name="reference" value={ref} />
        <div className={`${wave ? "bg-[#0c7ab0]" : "bg-[#c25400]"} text-white p-space-lg`}>
          <p className="font-label-md text-label-md uppercase tracking-wider opacity-100">{t("Simulateur")} • {wave ? "Wave" : "Orange Money"}</p>
          <p className="font-display-currency-mobile text-display-currency-mobile font-extrabold">{fcfa(montant)} FCFA</p>
        </div>
        <div className="p-space-lg flex flex-col gap-3">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("Cet écran remplace l'application de l'opérateur pendant le développement. Aucun argent réel n'est débité.")}
          </p>
          <button name="issue" value="ok" className="h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary">
            {t("Valider le paiement")}
          </button>
          <button name="issue" value="ko" className="h-12 rounded-xl bg-surface-container text-error font-label-lg text-label-lg font-bold hover:bg-error-container">
            {t("Refuser / annuler")}
          </button>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center">{t("Référence : {ref}", { ref })}</p>
        </div>
      </form>
    </main>
  );
}

export default function Page({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenu params={params} />
    </Suspense>
  );
}
