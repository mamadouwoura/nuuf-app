import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import ChampsProprietaire from "@/components/ChampsProprietaire";
import { creerProprietaire } from "@/app/actions/proprietaires";
import { db } from "@/lib/db";
import { initiales, telAffiche } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Propriétaires")) };
}

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const LABEL = "block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs";

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { t, tn } = await getT();
  const { erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const peutEcrire = membre.role !== "LECTURE_SEULE";
  const proprietaires = await db.proprietaire.findMany({
    where: { organisationId: membre.organisationId },
    orderBy: { nomComplet: "asc" },
    include: { _count: { select: { biens: { where: { archiveLe: null } } } }, mandats: { where: { actif: true }, orderBy: { creeLe: "desc" }, take: 1 } },
  });

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Propriétaires")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
            {t("Les propriétaires dont vous gérez les biens, avec leur mandat de gestion et leur compte rendu mensuel.")}
          </p>
        </div>
        <Link href="/import" className="inline-flex items-center gap-1.5 h-11 px-space-md rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-semibold">
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          {t("Importer")}
        </Link>
        <Link href="/bilans" className="inline-flex items-center gap-1.5 h-11 px-space-md rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-semibold">
          <span className="material-symbols-outlined text-[20px]">summarize</span>
          {t("Bilans du mois")}
        </Link>
      </div>

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}

      {peutEcrire && (
        <details className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg" open={proprietaires.length === 0}>
          <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold cursor-pointer select-none">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            {t("Ajouter un propriétaire")}
          </summary>
          <form action={creerProprietaire} className="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <ChampsProprietaire />
            <div className="sm:col-span-2">
              <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {t("Enregistrer le propriétaire")}
              </BoutonEnvoi>
            </div>
          </form>
        </details>
      )}

      {proprietaires.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun propriétaire pour l'instant.")}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {proprietaires.map((p) => {
            const mandat = p.mandats[0];
            return (
              <li key={p.id}>
                <Link href={`/proprietaires/${p.id}`} className="block bg-surface-container-lowest rounded-xl shadow-sm p-space-md hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-lg text-label-lg font-bold">{initiales(p.nomComplet)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{p.nomComplet}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{p.telephone ? telAffiche(p.telephone) : t("Téléphone non renseigné")}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold">
                      {tn(p._count.biens, "{n} bien", "{n} biens")}
                    </span>
                    {mandat ? (
                      <span className="px-2.5 py-1 rounded-full bg-success-container text-on-success-container font-label-md text-label-md font-bold">
                        {t("Mandat {numero} · {pct} %", { numero: mandat.numero, pct: String(mandat.commissionPct).replace(".", ",") })}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{t("Mandat à établir")}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
