import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fcfa } from "@/lib/immo";
import { courtMois, cleMois, debutMois, depuisCle, libelleMois, moisPrecedent } from "@/lib/loyers";
import { statistiques } from "@/lib/stats";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Statistiques")) };
}

const CARTE = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm";

async function Contenu({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const { t, locale } = await getT();
  const { mois: cle } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const maintenant = new Date();
  const mois = depuisCle(cle, debutMois(maintenant));
  const s = await statistiques(user.membres[0].organisationId, mois, maintenant);
  const precedent = cleMois(moisPrecedent(mois, 1));
  const suivant = cleMois(moisPrecedent(mois, -1));
  const maxi = Math.max(1, ...s.tendance.map((x) => x.attendu));
  const couleurTaux = (n: number) => (n >= 90 ? "text-primary" : n >= 60 ? "text-secondary" : "text-error");

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-4xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Statistiques")}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Link href={`/statistiques?mois=${precedent}`} aria-label={t("Mois précédent")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize min-w-36 text-center">{libelleMois(mois, locale)}</span>
          <Link href={`/statistiques?mois=${suivant}`} aria-label={t("Mois suivant")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Loyers attendus")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{fcfa(s.attendu)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Encaissés")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">{fcfa(s.encaisse)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Taux de recouvrement")}</p>
          <p className={`font-headline-sm text-headline-sm font-bold ${couleurTaux(s.tauxRecouvrement)}`}>{s.tauxRecouvrement} %</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Taux d'occupation")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{s.occupation.taux} %</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("{a} biens loués sur {b}", { a: s.occupation.occupes, b: s.occupation.biens })}</p>
        </div>
      </section>

      {s.payeDAvance.montant > 0 && (
        <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-3 py-2 font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
          {t("{montant} FCFA déjà payés d'avance pour les mois à venir ({n} paiement(s)).", { montant: fcfa(s.payeDAvance.montant), n: s.payeDAvance.nb })}
        </p>
      )}

      <section className={CARTE}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Recouvrement sur 6 mois")}</h2>
        <div className="flex items-end gap-3 h-40 px-1" role="img" aria-label={t("Loyers encaissés et attendus sur 6 mois")}>
          {s.tendance.map((x) => (
            <div key={x.mois.toISOString()} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="font-body-sm text-[11px] text-on-surface-variant">{x.attendu ? `${x.taux} %` : "—"}</span>
              <div className="w-full flex items-end justify-center gap-1 flex-1">
                <div className="w-1/2 rounded-t-md bg-surface-container-high" style={{ height: `${Math.max(2, Math.round((x.attendu / maxi) * 100))}%` }} title={`${t("Attendu")} : ${fcfa(x.attendu)} FCFA`} />
                <div className="w-1/2 rounded-t-md bg-primary" style={{ height: `${Math.max(2, Math.round((x.encaisse / maxi) * 100))}%` }} title={`${t("Encaissé")} : ${fcfa(x.encaisse)} FCFA`} />
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant capitalize">{courtMois(x.mois, locale)}</span>
            </div>
          ))}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-surface-container-high" />{t("Attendu")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" />{t("Encaissé")}</span>
        </p>
      </section>

      <section className={CARTE}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Impayés par ancienneté")}</h2>
          <span className="font-label-lg text-label-lg font-bold text-error">{fcfa(s.arrieres.total)} FCFA</span>
        </div>
        {s.arrieres.nb === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun impayé en retard. Bravo.")}</p>
        ) : (
          <>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
              {s.arrieres.tranches.map((tr) => (
                <li key={tr.cle} className="rounded-xl bg-surface-container-low p-3">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t(tr.libelle)}</p>
                  <p className="font-label-lg text-label-lg font-bold text-on-surface">{fcfa(tr.montant)} FCFA</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t("{n} loyer(s)", { n: tr.nb })}</p>
                </li>
              ))}
            </ul>
            <h3 className="font-label-lg text-label-lg text-on-surface font-semibold mt-2">{t("Les plus anciens")}</h3>
            <ul className="flex flex-col gap-2">
              {s.arrieres.plusAnciens.map((a) => (
                <li key={a.echeanceId}>
                  <Link href={`/locataires/${a.locataireId}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2 hover:bg-surface-container">
                    <span className="min-w-0">
                      <span className="block truncate font-label-lg text-label-lg text-on-surface font-semibold">{a.locataire}</span>
                      <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">{a.bien} · <span className="capitalize">{libelleMois(a.mois, locale)}</span></span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-label-lg text-label-lg font-bold text-error">{fcfa(a.reste)} FCFA</span>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("{n} j de retard", { n: a.jours })}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {s.parProprietaire.some((p) => p.id) && (
        <section className={CARTE}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Par propriétaire")}</h2>
          <ul className="flex flex-col gap-2">
            {s.parProprietaire.map((p) => (
              <li key={p.id ?? "aucun"} className="rounded-xl bg-surface-container-low px-3 py-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-label-lg text-label-lg text-on-surface font-semibold">{p.nom ?? t("Sans propriétaire")}</span>
                  <span className={`shrink-0 font-label-lg text-label-lg font-bold ${couleurTaux(p.taux)}`}>{p.taux} %</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p.taux}%` }} /></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t("{enc} encaissés sur {att} FCFA", { enc: fcfa(p.encaisse), att: fcfa(p.attendu) })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function Page(props: { searchParams: Promise<{ mois?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
