import { Suspense } from "react";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate, nomMois } from "@/lib/i18n/format";
import Preferences from "@/components/Preferences";


/** Page publique atteinte en scannant le QR d'une quittance. N'expose que le strict nécessaire. */
async function Verification({ params }: { params: Promise<{ jeton: string }> }) {
  const { t, locale } = await getT();
  const { jeton } = await params;
  const q = await db.quittance.findUnique({
    where: { jetonQr: jeton },
    include: { paiement: { include: { echeance: { include: { bail: { include: { locataire: true, bien: { include: { organisation: true } } } } } } } } },
  });

  if (!q) {
    return (
      <main className="min-h-screen flex items-center justify-center p-space-md">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-error">gpp_bad</span>
          <h1 className="font-headline-md text-headline-md text-on-surface mt-2">{t("Quittance introuvable")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {t("Ce code ne correspond à aucune quittance émise sur Nuuf. Méfiez-vous : le document présenté est peut-être falsifié.")}
          </p>
        </div>
      </main>
    );
  }

  const e = q.paiement.echeance;
  const loc = e.bail.locataire.nomComplet.split(" ");
  const nomPartiel = `${loc[0]} ${loc.slice(1).map((x) => x[0] + ".").join(" ")}`.trim();

  return (
    <main className="min-h-screen flex items-center justify-center p-space-md">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
        <div className="bg-primary-container text-on-primary p-space-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <h1 className="font-headline-sm text-headline-sm">{t("Quittance authentique")}</h1>
            <p className="font-body-sm text-body-sm opacity-90">{t("Émise via Nuuf")} • {q.numero}</p>
          </div>
        </div>
        <dl className="p-space-lg flex flex-col gap-space-sm font-body-md text-body-md">
          {[
            [t("Bailleur"), e.bail.bien.organisation.nom],
            [t("Locataire"), nomPartiel],
            [t("Logement"), e.bail.bien.designation],
            [t("Période"), `${nomMois(e.mois, locale)} ${e.mois.getUTCFullYear()}`],
            [t("Montant versé"), `${fcfa(q.paiement.montant)} FCFA`],
            [t("Date d'émission"), formaterDate(q.emiseLe, locale, { day: "2-digit", month: "long", year: "numeric" })],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-surface-container pb-2">
              <dt className="text-on-surface-variant">{k}</dt>
              <dd className="text-on-surface font-semibold text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}

export default function Page({ params }: { params: Promise<{ jeton: string }> }) {
  return (
    <>
      <Preferences flottant />
      <Suspense fallback={null}>
        <Verification params={params} />
      </Suspense>
    </>
  );
}
