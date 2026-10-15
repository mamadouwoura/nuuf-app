import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { recapitulatifDuMois } from "@/lib/bilan";
import { fcfa } from "@/lib/immo";
import { cleMois, debutMois, depuisCle, libelleMois, moisPrecedent } from "@/lib/loyers";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Bilans du mois")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const { t, locale } = await getT();
  const { mois: cle } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const maintenant = new Date();
  const mois = depuisCle(cle, debutMois(maintenant));
  const r = await recapitulatifDuMois(user.membres[0].organisationId, mois, maintenant);
  const precedent = cleMois(moisPrecedent(mois, 1));
  const suivant = cleMois(moisPrecedent(mois, -1));
  const cleCourante = cleMois(mois);

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-4xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Bilans du mois")}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Link href={`/bilans?mois=${precedent}`} aria-label={t("Mois précédent")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize min-w-36 text-center">{libelleMois(mois, locale)}</span>
          <Link href={`/bilans?mois=${suivant}`} aria-label={t("Mois suivant")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        {[
          [t("Loyers attendus"), r.attendu, "text-on-surface"],
          [t("Encaissés"), r.encaisse, "text-primary"],
          [t("Commissions"), r.commission, "text-on-surface"],
          [t("Reste à reverser"), r.aReverser, "text-primary"],
        ].map(([lib, val, cl]) => (
          <div key={String(lib)} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <p className="font-body-sm text-body-sm text-on-surface-variant">{lib}</p>
            <p className={`font-headline-sm text-headline-sm font-bold ${cl}`}>{fcfa(Number(val))} <span className="text-[12px] font-semibold">FCFA</span></p>
          </div>
        ))}
      </section>

      {r.bilans.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun propriétaire pour l'instant.")}</p>
          <Link href="/proprietaires" className="inline-flex mt-3 h-11 items-center px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
            {t("Ajouter un propriétaire")}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {r.bilans.map((b) => (
            <li key={b.proprietaire.id}>
              <Link href={`/proprietaires/${b.proprietaire.id}/bilan?mois=${cleCourante}`} className="block bg-surface-container-lowest rounded-xl shadow-sm p-space-md hover:bg-surface-container-low transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{b.proprietaire.nomComplet}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t("Encaissé {enc} sur {du} FCFA", { enc: fcfa(b.encaisse), du: fcfa(b.attendu) })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-label-lg text-label-lg font-bold text-primary">{fcfa(b.net)} FCFA</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${b.reversement ? "bg-success-container text-on-success-container" : "bg-secondary-fixed text-on-secondary-fixed-variant"}`}>
                      {b.reversement ? t("Reversé") : t("À reverser")}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
