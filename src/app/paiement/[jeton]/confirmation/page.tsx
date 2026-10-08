import { Suspense } from "react";
import { notFound } from "next/navigation";
import ConfirmationPaiement from "@/components/ConfirmationPaiement";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { appUrl, urlVerification } from "@/lib/quittance";
import { chargerParJeton, moisLongFr } from "@/lib/public-paiement";
import { formaterDate } from "@/lib/i18n/format";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";
import Preferences from "@/components/Preferences";

const fond = "bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen";
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: N_("Espèces"), VIREMENT: N_("Virement") } as const;

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { jeton } = await params;
  const { ref } = await searchParams;
  const { t, locale } = await getT();
  const c = await chargerParJeton(jeton, locale);
  if (!c) notFound();
  const p = c.e.paiements.find((x) => x.referenceOperateur === ref) ?? c.e.paiements[0];
  if (!p?.quittance) notFound();
  const q = p.quittance;
  const e = c.e;
  const fin = new Date(Date.UTC(e.mois.getUTCFullYear(), e.mois.getUTCMonth() + 1, 0));
  const jj = (d: Date) => String(d.getUTCDate()).padStart(2, "0");
  const mm = (d: Date) => String(d.getUTCMonth() + 1).padStart(2, "0");
  const quand = p.recuLe ?? p.creeLe;
  const heure = formaterDate(quand, locale, { hour: "2-digit", minute: "2-digit" });
  const complet = c.reste === 0;
  const lienPdf = `/q/${q.jetonQr}/pdf`;

  return (
    <ConfirmationPaiement
      d={{
        jetonQr: q.jetonQr,
        bailleur: c.infos.bailleur,
        bailleurInit: c.infos.bailleurInit,
        bailleurTelBrut: c.bailleurTelBrut,
        locNom: c.locataire.nomComplet,
        locTel: telAffiche(c.locataire.telephone),
        locInit: initiales(c.locataire.nomComplet),
        bienNom: c.infos.bien,
        bienLieu: c.infos.lieu,
        periode: moisLongFr(e.mois, locale),
        plage: `01/${mm(e.mois)} au ${jj(fin)}/${mm(fin)}/${fin.getUTCFullYear()}`,
        loyer: fcfa(e.montantDu),
        total: fcfa(p.montant),
        solde: complet ? t("Acquitté à 100% • Solde : 0 FCFA") : t("Acompte reçu • Reste dû : {montant} FCFA", { montant: fcfa(c.reste) }),
        complet,
        canal: t(CANAL[p.canal]),
        dateHeure: `${formaterDate(quand, locale, { day: "2-digit", month: "short", year: "numeric" })} • ${heure}`,
        dateCourte: `${formaterDate(quand, locale, { day: "2-digit", month: "2-digit", year: "numeric" })} • ${heure}`,
        reference: p.referenceOperateur ?? "—",
        numero: q.numero,
        lienPdf,
        lienVerif: urlVerification(q.jetonQr).replace(appUrl(), ""),
        lienPartage: `https://wa.me/?text=${encodeURIComponent(`Ma quittance de loyer ${q.numero} : ${appUrl()}${lienPdf}`)}`,
        lienBailleur: c.infos.bailleurWa,
      }}
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
