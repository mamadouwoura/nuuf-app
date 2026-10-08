import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, initiales, statutLoyer, libelleStatut, telAffiche, TYPE_LIBELLE } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { formaterDate, nomMois } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Fiche du bien")) };
}


const PASTILLE = {
  PAYE: "bg-success-container text-on-success-container",
  EN_ATTENTE: "bg-secondary-fixed text-on-secondary-fixed-variant",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  EN_RETARD: "bg-error-container text-on-error-container",
  VACANT: "bg-surface-container-high text-on-surface-variant",
} as const;

async function Fiche({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { t, locale } = await getT();
  const moisFr = (d: Date) => `${nomMois(d, locale)} ${d.getUTCFullYear()}`;
  const dateFr = (d: Date) => formaterDate(d, locale);
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const bien = await db.bien.findFirst({
    where: { id, organisationId: user.membres[0].organisationId },
    include: {
      photos: { orderBy: { creeLe: "asc" } },
      baux: {
        where: { actif: true },
        include: { locataire: true, echeances: { orderBy: { mois: "desc" }, take: 12, include: { paiements: true } } },
        take: 1,
      },
    },
  });
  if (!bien) notFound();
  const bail = bien.baux[0];
  const now = new Date();
  const st = statutLoyer(bail?.echeances[0], now);
  const prochaine = bail?.echeances.find((e) => e.statut !== "PAYEE");

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant mb-space-xs">
            <Link href="/biens" className="flex items-center gap-1 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>{t("Retour à Mes biens")}</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{bien.designation}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[st.code]}`}>
              {st.code === "VACANT" ? t("Vacant") : `${t("Occupé")} • ${libelleStatut(st, t)}`}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-space-sm">
        {user.membres[0].role !== "LECTURE_SEULE" && (
          <Link href={`/biens/${id}/modifier`} className="flex items-center gap-2 h-12 px-space-md rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-all shadow-sm font-label-lg text-label-lg font-bold">
            <span className="material-symbols-outlined text-[20px]">edit</span>
            <span>{t("Modifier")}</span>
          </Link>
        )}
        {bail && (
          <a href={`/biens/${id}/contrat`} target="_blank" className="flex items-center gap-2 h-12 px-space-md rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-all shadow-sm font-label-lg text-label-lg font-bold">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <span>{t("Contrat PDF")}</span>
          </a>
        )}
        {bail && (
          <a
            href={`https://wa.me/${bail.locataire.telephone.replace(/\D/g, "")}`}
            target="_blank"
            className="flex items-center gap-2 h-12 px-space-md rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-sm font-label-lg text-label-lg font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>{t("WhatsApp Locataire")}</span>
          </a>
        )}
        </div>
      </div>

      {ok && <p className="rounded-xl bg-success-container text-on-success-container px-space-md py-2 font-body-md text-body-md">{t("Modifications enregistrées.")}</p>}

      {bien.photos.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
          {bien.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={`/biens/${id}/photos/${p.id}`} alt={t("{nom} - photo {n}", { nom: bien.designation, n: i + 1 })} loading={i < 2 ? "eager" : "lazy"} className={`w-full object-cover rounded-xl bg-surface-container ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`} />
          ))}
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
          <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
          <span>
            {bien.adresse ? `${bien.adresse}, ` : ""}
            {bien.quartier}, {bien.ville} (Sénégal)
          </span>
        </div>
        <p className="font-headline-sm text-headline-sm text-on-surface">
          {TYPE_LIBELLE[bien.type]}
          {bien.surfaceM2 ? ` • ${bien.surfaceM2} m²` : ""}
        </p>
        {bien.description && (
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{bien.description}</p>
        )}
      </section>

      {bail ? (
        <>
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-1">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Loyer mensuel")}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-primary">{fcfa(bail.loyerMensuel)}</span>
                <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">{t("FCFA / mois")}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{bail.chargesIncluses ? t("Charges comprises") : t("Hors charges")}</span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-1">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Dépôt de garantie")}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">{fcfa(bail.loyerMensuel * bail.cautionMois)}</span>
                <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t("{n} mois de caution", { n: bail.cautionMois })}</span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-1">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Prochaine échéance")}</span>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {prochaine ? dateFr(prochaine.dateLimite) : "—"}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Le {jour} de chaque mois", { jour: String(bail.jourEcheance).padStart(2, "0") })}</span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-1">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Prise d'effet")}</span>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">{dateFr(bail.debutLe)}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Bail actif")}</span>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t("Locataire en place")}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold">{t("Bail actif")}</span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center font-bold">
                {initiales(bail.locataire.nomComplet)}
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{bail.locataire.nomComplet}</h3>
                {bail.locataire.profession && (
                  <p className="font-body-md text-body-md text-on-surface-variant">{bail.locataire.profession}</p>
                )}
                <p className="font-label-lg text-label-lg text-primary font-bold">{telAffiche(bail.locataire.telephone)}</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{t("Historique des loyers")}</h2>
            </div>
            <div className="flex flex-col divide-y divide-surface-container">
              {bail.echeances.map((e) => {
                const s = statutLoyer(e, now);
                return (
                  <div key={e.id} className="flex items-center justify-between py-3">
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize">{moisFr(e.mois)}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Échéance le {date}", { date: dateFr(e.dateLimite) })}</span>
                    </div>
                    <div className="flex items-center gap-space-md">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(e.montantDu)} FCFA</span>
                      <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[s.code]}`}>{libelleStatut(s, t)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col items-center text-center gap-2">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person_off</span>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun locataire en place sur ce bien.")}</p>
        </section>
      )}
    </div>
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">{t("Chargement…")}</p>}>
      <Fiche params={params} searchParams={searchParams} />
    </Suspense>
  );
}
