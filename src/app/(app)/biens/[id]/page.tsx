import BoutonEnvoi from "@/components/BoutonEnvoi";
import ChampsAppreciation from "@/components/ChampsAppreciation";
import { nouveauLocataire, terminerBail } from "@/app/actions/biens";
import { MOTIFS_FIN } from "@/lib/motifs";
import { ficheComplete } from "@/lib/fiche";
import Chargement from "@/components/Chargement";
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

async function Fiche({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { t, locale } = await getT();
  const moisFr = (d: Date) => `${nomMois(d, locale)} ${d.getUTCFullYear()}`;
  const dateFr = (d: Date) => formaterDate(d, locale);
  const [{ id }, { ok, erreur }] = await Promise.all([params, searchParams]);
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
  const peutEcrire = user.membres[0].role !== "LECTURE_SEULE";

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

      {bail && user.membres[0].role !== "LECTURE_SEULE" && !ficheComplete(bail.locataire) && (
        <div className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-space-md py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <p className="font-body-md text-body-md">{t("La fiche de renseignement de {nom} n'est pas complète. Remplissez-la avec lui avant d'éditer le contrat.", { nom: bail.locataire.nomComplet })}</p>
          <Link href={`/locataires/${bail.locataire.id}/fiche`} className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            {t("Remplir la fiche")}
          </Link>
        </div>
      )}

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}
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

          {peutEcrire && (
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Le locataire quitte le bien")}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("Le bail prend fin à la date indiquée, les loyers à venir non réglés sont retirés et le bien devient vacant. L'historique des loyers et les quittances sont conservés.")}
              </p>
              <details>
                <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold cursor-pointer select-none">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  {t("Enregistrer le départ…")}
                </summary>
                <form action={terminerBail} className="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-md items-end">
                  <input type="hidden" name="id" value={id} />
                  <div>
                    <label htmlFor="finLe" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Date de départ")}</label>
                    <input id="finLe" name="finLe" type="date" required defaultValue={now.toISOString().slice(0, 10)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" />
                  </div>
                  <div>
                    <label htmlFor="motifFin" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Motif de fin de location")}</label>
                    <select id="motifFin" name="motifFin" defaultValue="FIN_NORMALE" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface">
                      {MOTIFS_FIN.map((m) => (
                        <option key={m.code} value={m.code}>{t(m.libelle)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <ChampsAppreciation t={t} idPrefixe="depart" />
                  </div>
                  <div className="sm:col-span-2">
                    <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-error text-on-error font-label-lg text-label-lg font-bold">
                      {t("Confirmer le départ de {nom}", { nom: bail.locataire.nomComplet })}
                    </BoutonEnvoi>
                  </div>
                </form>
              </details>
            </section>
          )}
        </>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col items-center text-center gap-2">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person_off</span>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun locataire en place sur ce bien.")}</p>
          {peutEcrire && !bien.archiveLe && (
            <details className="w-full max-w-xl text-left mt-space-sm" open>
              <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold cursor-pointer select-none">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                {t("Installer un nouveau locataire")}
              </summary>
              <form action={nouveauLocataire} className="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <input type="hidden" name="id" value={id} />
                <div className="sm:col-span-2">
                  <label htmlFor="locNom" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Nom et Prénom")}</label>
                  <input id="locNom" name="locNom" required className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" autoComplete="off" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="locTel" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Téléphone mobile & WhatsApp")}</label>
                  <input id="locTel" name="locTel" type="tel" inputMode="tel" required placeholder="77 000 00 00" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" autoComplete="off" />
                </div>
                <div>
                  <label htmlFor="loyer" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Loyer mensuel (FCFA)")}</label>
                  <input id="loyer" name="loyer" inputMode="numeric" required placeholder="250 000" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label htmlFor="cautionMois" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Caution (mois)")}</label>
                  <input id="cautionMois" name="cautionMois" inputMode="numeric" defaultValue="2" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label htmlFor="jour" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Jour d'échéance du loyer")}</label>
                  <input id="jour" name="jour" inputMode="numeric" defaultValue="5" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" />
                </div>
                <div>
                  <label htmlFor="debut" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Date de prise d'effet")}</label>
                  <input id="debut" name="debut" type="date" required defaultValue={now.toISOString().slice(0, 10)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface" />
                </div>
                <div className="sm:col-span-2">
                  <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                    {t("Enregistrer et remplir la fiche")}
                  </BoutonEnvoi>
                </div>
              </form>
            </details>
          )}
        </section>
      )}
    </div>
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Fiche params={params} searchParams={searchParams} />
    </Suspense>
  );
}
