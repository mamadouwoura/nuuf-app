import { Suspense } from "react";
import { notFound } from "next/navigation";
import ConfirmationPaiement from "@/components/ConfirmationPaiement";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { appUrl, urlVerification } from "@/lib/quittance";
import { chargerParJeton, moisLongFr } from "@/lib/public-paiement";

const fond = "bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen";
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { jeton } = await params;
  const { ref } = await searchParams;
  const c = await chargerParJeton(jeton);
  if (!c) notFound();
  const p = c.e.paiements.find((x) => x.referenceOperateur === ref) ?? c.e.paiements[0];
  if (!p?.quittance) notFound();
  const q = p.quittance;
  const e = c.e;
  const fin = new Date(Date.UTC(e.mois.getUTCFullYear(), e.mois.getUTCMonth() + 1, 0));
  const jj = (d: Date) => String(d.getUTCDate()).padStart(2, "0");
  const mm = (d: Date) => String(d.getUTCMonth() + 1).padStart(2, "0");
  const quand = p.recuLe ?? p.creeLe;
  const heure = quand.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
        periode: moisLongFr(e.mois),
        plage: `01/${mm(e.mois)} au ${jj(fin)}/${mm(fin)}/${fin.getUTCFullYear()}`,
        loyer: fcfa(e.montantDu),
        total: fcfa(p.montant),
        solde: complet ? "Acquitté à 100% • Solde : 0 FCFA" : `Acompte reçu • Reste dû : ${fcfa(c.reste)} FCFA`,
        complet,
        canal: CANAL[p.canal],
        dateHeure: `${quand.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })} • ${heure}`,
        dateCourte: `${quand.toLocaleDateString("fr-FR")} • ${heure}`,
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
      <Suspense fallback={null}>
        <Contenu {...props} />
      </Suspense>
    </div>
  );
}
