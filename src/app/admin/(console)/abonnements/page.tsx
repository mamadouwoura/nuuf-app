import Chargement from "@/components/Chargement";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { exigerAdmin, listerBailleurs } from "@/lib/admin";
import { FORFAITS } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Abonnements")) };
}


async function Contenu() {
  const { t, locale } = await getT();
  const dateFr = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "short", year: "numeric" });
  await exigerAdmin(); // les données ne sont lues qu'après la vérification
  const [lignes, factures] = await Promise.all([
    listerBailleurs(),
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
              {l.proprio && (
                <a href={`https://wa.me/${l.proprio.telephone.replace(/\D/g, "")}`} target="_blank" className="px-3 py-1 rounded-lg bg-action-soft text-on-action-soft font-label-md text-label-md font-semibold">WhatsApp</a>
              )}
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

export default async function Page() {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu />
    </Suspense>
  );
}
