import Chargement from "@/components/Chargement";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { exigerAdmin, listerBailleurs } from "@/lib/admin";
import { rappelerCompte, rappelerComptes } from "@/app/actions/admin";
import { ciblesRappel } from "@/lib/rappels";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { FORFAITS } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Abonnements")) };
}


async function Contenu({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { t, locale } = await getT();
  const dateFr = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "short", year: "numeric" });
  await exigerAdmin(); // les données ne sont lues qu'après la vérification
  const { ok } = await searchParams;
  const [lignes, cibles, factures] = await Promise.all([
    listerBailleurs(),
    ciblesRappel(),
    db.factureAbonnement.findMany({
      where: { payeeLe: { not: null } },
      orderBy: { payeeLe: "desc" },
      take: 20,
      include: { abonnement: { include: { organisation: true } } },
    }),
  ]);
  const payants = lignes.filter((l) => l.categorie === "payant");
  const aRelancer = lignes.filter((l) => l.categorie === "expire" || l.acces.etat === "GRACE");
  const expirent = lignes.filter((l) => l.categorie === "essai" && (l.acces.joursRestants ?? 99) <= 5);
  const carte = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm";

  return (
    <>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Abonnements")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Revenus récurrents, renouvellements et comptes à relancer.")}</p>
      </div>

      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container px-space-md py-3 font-body-md text-body-md">{ok}</p>}
      {cibles.length > 0 && (
        <section className="bg-secondary-fixed/60 rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-body-md text-body-md text-on-surface">
            <b>{t("{n} compte(s) à rappeler", { n: cibles.length })}</b> — {t("essais qui se terminent, essais terminés et abonnements en retard. Un compte déjà rappelé depuis moins de 3 jours est ignoré.")}
          </p>
          <form action={rappelerComptes}>
            <BoutonEnvoi enCours={t("Envoi des rappels…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold whitespace-nowrap">{t("Rappeler tous")}</BoutonEnvoi>
          </form>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <div className={carte}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Répartition")}</h2>
          {(["BAILLEUR", "PRO", "AGENCE"] as const).map((f) => {
            const l = payants.filter((x) => x.forfait === f);
            return (
              <div key={f} className="flex justify-between font-body-md text-body-md">
                <span>{t(FORFAITS[f].nom)} ({l.length})</span>
                <span className="font-label-lg text-label-lg text-primary font-bold">{fcfa(l.reduce((s, x) => s + x.mrr, 0))} FCFA/{t("mois")}</span>
              </div>
            );
          })}
        </div>
        <div className={carte}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Essais qui se terminent (≤ 5 j)")}</h2>
          {expirent.length === 0 ? <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun.")}</p> : expirent.map((l) => (
            <div key={l.id} className="flex justify-between font-body-md text-body-md">
              <span>{l.nom}</span>
              <span className="text-secondary font-semibold">{l.acces.joursRestants} j</span>
            </div>
          ))}
        </div>
        <div className={carte}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("À relancer (expirés / en retard)")}</h2>
          {aRelancer.length === 0 ? <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun.")}</p> : aRelancer.map((l) => (
            <div key={l.id} className="flex items-center justify-between font-body-md text-body-md">
              <span>{l.nom}</span>
              <span className="flex items-center gap-2">
                <form action={rappelerCompte}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="px-3 py-1 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold">{t("Rappel")}</button>
                </form>
                {l.proprio && (
                  <a href={`https://wa.me/${l.proprio.telephone.replace(/\D/g, "")}`} target="_blank" className="px-3 py-1 rounded-lg bg-action-soft text-on-action-soft font-label-md text-label-md font-semibold">WhatsApp</a>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">{t("Dernières factures payées")}</h2>
        {factures.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune facture pour le moment.")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {factures.map((f) => (
              <div key={f.id} className="py-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">{f.abonnement.organisation.nom}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {t(FORFAITS[f.forfait].nom)} • {f.annuel ? t("annuel") : t("mensuel")} • {dateFr(f.payeeLe!)} • {f.referenceOperateur}
                  </span>
                </div>
                <span className="font-label-lg text-label-lg text-primary font-bold">{fcfa(f.montant)} FCFA</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default async function Page(props: { searchParams: Promise<{ ok?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
