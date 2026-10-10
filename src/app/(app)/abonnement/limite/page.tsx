import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FORFAITS, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Limite de logements")) };
}

async function Contenu() {
  const { t } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const forfait = membre.organisation.abonnement?.forfait ?? "DECOUVERTE";
  const f = FORFAITS[forfait];
  const nb = await db.bien.count({ where: { organisationId: membre.organisationId, archiveLe: null } });
  const suivant = forfait === "PRO" ? "AGENCE" : "PRO";

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-2xl">
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-xl flex flex-col gap-space-md items-center text-center">
        <span className="material-symbols-outlined text-[48px] text-secondary">domain_add</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t("Vous avez atteint la limite de votre forfait")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {Number.isFinite(f.logements) ? t("Le forfait {nom} inclut {n} logements. Pour en ajouter d'autres, passez au forfait {suivant}.", { nom: t(f.nom), n: f.logements, suivant: t(FORFAITS[suivant].nom) }) : t("Le forfait {nom} inclut un nombre illimité de logements.", { nom: t(f.nom) })}
        </p>
        <div className="w-full">
          <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
            <span>{t("Logements enregistrés")}</span>
            <span>{nb} / {f.logements}</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container overflow-hidden"><div className="h-full bg-error" style={{ width: "100%" }}></div></div>
        </div>
        <div className="w-full rounded-xl bg-surface-container-low p-space-md text-left">
          <p className="font-label-lg text-label-lg text-on-surface font-bold">{t("Forfait {nom}", { nom: t(FORFAITS[suivant].nom) })}</p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {suivant === "AGENCE" ? t("Logements illimités") : t("Jusqu'à {n} logements", { n: FORFAITS[suivant].logements })} • {t("{n} accès équipe", { n: FORFAITS[suivant].acces })} • {fcfa(prixMensuel(suivant, nb))} FCFA / {t("mois")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-space-sm w-full">
          <Link href="/abonnement/forfait" className="flex-1 h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center hover:bg-primary">{t("Passer au forfait {nom}", { nom: t(FORFAITS[suivant].nom) })}</Link>
          <Link href="/biens" className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center hover:bg-surface-container-high">{t("Retour à mes biens")}</Link>
        </div>
      </div>
    </div>
  );
}

export default async function Page() {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu />
    </Suspense>
  );
}
