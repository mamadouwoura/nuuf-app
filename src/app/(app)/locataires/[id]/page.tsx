import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, initiales, statutLoyer, libelleStatut, telAffiche } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { formaterDate, nomMois } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Fiche locataire")) };
}

const PASTILLE = {
  PAYE: "bg-success-container text-on-success-container",
  EN_ATTENTE: "bg-secondary-fixed text-on-secondary-fixed-variant",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  EN_RETARD: "bg-error-container text-on-error-container",
  VACANT: "bg-surface-container-high text-on-surface-variant",
} as const;

async function Fiche({ params }: { params: Promise<{ id: string }> }) {
  const { t, tn, locale } = await getT();
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const loc = await db.locataire.findFirst({
    where: { id, organisationId: user.membres[0].organisationId },
    include: {
      baux: {
        orderBy: { debutLe: "desc" },
        include: { bien: true, echeances: { orderBy: { mois: "desc" }, include: { paiements: { where: { statut: "CONFIRME" } } } } },
      },
    },
  });
  if (!loc) notFound();
  const now = new Date();
  const bail = loc.baux.find((b) => b.actif) ?? loc.baux[0];
  const echeances = loc.baux.flatMap((b) => b.echeances);
  const verse = echeances.reduce((s, e) => s + e.paiements.reduce((x, p) => x + p.montant, 0), 0);
  const nbQuittances = echeances.reduce((s, e) => s + e.paiements.length, 0);
  const closes = echeances.filter((e) => e.dateLimite < now);
  const aTemps = closes.filter((e) => e.statut === "PAYEE").length;
  const st = statutLoyer(bail?.echeances[0], now);
  const prochaine = bail?.echeances.find((e) => e.statut !== "PAYEE");

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <Link href="/locataires" className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("Locataires")}
        </Link>
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{loc.nomComplet}</h1>
          <span className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[st.code]}`}>
            {bail?.actif ? `${t("Locataire en place")} • ${libelleStatut(st, t)}` : t("Ancien locataire")}
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Total loyers versés")}</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(verse)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tn(nbQuittances, "{n} quittance acquittée", "{n} quittances acquittées")}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Ponctualité locative")}</span>
          <div className="mt-2 font-display-currency-mobile text-display-currency-mobile text-primary">
            {closes.length ? `${Math.round((aTemps / closes.length) * 100)}%` : "—"}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tn(closes.length, "{a}/{n} échéance réglée", "{a}/{n} échéances réglées", { a: aTemps })}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Prochaine échéance")}</span>
          <div className="mt-2 font-display-currency-mobile text-display-currency-mobile text-on-surface">
            {prochaine ? formaterDate(prochaine.dateLimite, locale, { day: "2-digit", month: "short" }) : "—"}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{bail ? t("{montant} FCFA / mois", { montant: fcfa(bail.loyerMensuel) }) : ""}</p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col lg:flex-row gap-space-lg">
        <div className="flex items-center gap-space-md lg:w-1/2">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center font-bold">{initiales(loc.nomComplet)}</div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{loc.nomComplet}</h2>
            {loc.profession && <p className="font-body-md text-body-md text-on-surface-variant">{loc.profession}</p>}
            {bail && <p className="font-body-sm text-body-sm text-on-surface-variant">{bail.bien.designation}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm lg:w-1/2">
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("Téléphone mobile")}</span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold">{telAffiche(loc.telephone)}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("CNI / Passeport")}</span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold">{loc.cni ?? t("Non renseignée")}</span>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">{t("Historique des loyers")}</h2>
        {echeances.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune échéance.")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {echeances.map((e) => {
              const s = statutLoyer(e, now);
              return (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize">
                    {nomMois(e.mois, locale)} {e.mois.getUTCFullYear()}
                  </span>
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(e.montantDu)} FCFA</span>
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[s.code]}`}>{libelleStatut(s, t)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">{t("Chargement…")}</p>}>
      <Fiche params={params} />
    </Suspense>
  );
}
