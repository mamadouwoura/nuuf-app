import { Suspense } from "react";
import { redirect } from "next/navigation";
import EcranEchec from "@/components/EcranEchec";
import PaiementLocataire from "@/components/PaiementLocataire";
import { telAffiche } from "@/lib/immo";
import { chargerParJeton, dateLongFr } from "@/lib/public-paiement";
import { getT } from "@/lib/i18n/server";
import Preferences from "@/components/Preferences";

const fond = "bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen pt-safe pb-safe";

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const { jeton } = await params;
  const { erreur } = await searchParams;
  const { locale } = await getT();
  const c = await chargerParJeton(jeton, locale);
  if (!c) return <EcranEchec variante="invalide" />;
  if (c.reste === 0) {
    const p = c.e.paiements[0];
    redirect(`/paiement/${jeton}/confirmation?ref=${p?.referenceOperateur ?? ""}`);
  }
  if (c.expire) return <EcranEchec variante="expire" d={c.infos} jeton={jeton} />;
  return (
    <PaiementLocataire
      d={{
        jeton,
        bienNom: c.infos.bien,
        bienLieu: c.infos.lieu,
        moisLabel: c.infos.mois,
        montant: c.infos.montant,
        bailleur: c.infos.bailleur,
        bailleurInit: c.infos.bailleurInit,
        bailleurTel: c.infos.bailleurTel,
        bailleurTelBrut: c.bailleurTelBrut,
        locNom: c.locataire.nomComplet,
        locTel: telAffiche(c.locataire.telephone),
        echeance: dateLongFr(c.e.dateLimite, locale),
        erreur,
      }}
    />
  );
}

export default function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ erreur?: string }> }) {
  return (
    <div className={fond}>
      <Preferences flottant />
      <Suspense fallback={null}>
        <Contenu {...props} />
      </Suspense>
    </div>
  );
}
