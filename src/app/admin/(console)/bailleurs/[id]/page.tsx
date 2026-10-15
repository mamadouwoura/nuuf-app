import Chargement from "@/components/Chargement";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { exigerAdmin, listerBailleurs } from "@/lib/admin";
import { prolongerEssai, changerForfaitEssai } from "@/app/actions/admin";
import { FORFAITS } from "@/lib/forfaits";
import { telAffiche } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";
import BoutonEnvoi from "@/components/BoutonEnvoi";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Bailleurs")) };
}

type Params = { ok?: string; erreur?: string };

async function Contenu({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Params> }) {
  const { t, locale } = await getT();
  await exigerAdmin();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const l = (await listerBailleurs()).find((x) => x.id === id);
  if (!l) notFound();
  const dateFr = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "short", year: "numeric" });
  const paye = l.categorie === "payant";
  const carte = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md";
  const bouton = "h-11 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold";

  return (
    <>
      <div>
        <Link href="/admin/bailleurs" className="font-label-md text-label-md text-primary font-semibold">← {t("Bailleurs")}</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">{l.nom}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {l.proprio ? telAffiche(l.proprio.telephone) : "—"} • {l.profil === "AGENCE" ? t("Agence immobilière") : t("Bailleur particulier")} • {t(FORFAITS[l.forfait].nom)} • {l.logements} {t("Logements")}
        </p>
      </div>

      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container p-3 font-label-md text-label-md">{ok}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container p-3 font-label-md text-label-md">{erreur}</p>}

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Essai")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {paye
            ? t("Abonnement payant en cours.")
            : l.acces.etat === "ESSAI"
              ? t("Essai ({n} j restants)", { n: l.acces.joursRestants ?? 0 }) + (l.acces.finLe ? ` — ${dateFr(l.acces.finLe)}` : "")
              : t("Expiré")}
        </p>
        {!paye && (
          <form action={prolongerEssai} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={l.id} />
            <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="jours">
              {t("Prolonger de")}
              <select id="jours" name="jours" defaultValue="14" className="h-11 px-3 rounded-xl bg-surface-container-low font-body-md text-body-md">
                <option value="7">7 {t("jours")}</option>
                <option value="14">14 {t("jours")}</option>
                <option value="30">30 {t("jours")}</option>
              </select>
            </label>
            <BoutonEnvoi className={bouton} enCours={t("Enregistrement…")}>{t("Prolonger l'essai")}</BoutonEnvoi>
          </form>
        )}
      </section>

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Forfait d'essai")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("Permet à un testeur d'essayer Pro ou Agence sans payer. Sans effet sur un compte payant.")}
        </p>
        {!paye && (
          <form action={changerForfaitEssai} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={l.id} />
            <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="forfait">
              {t("Forfait")}
              <select id="forfait" name="forfait" defaultValue={l.forfait} className="h-11 px-3 rounded-xl bg-surface-container-low font-body-md text-body-md">
                {(["DECOUVERTE", "PRO", "AGENCE"] as const).map((f) => (
                  <option key={f} value={f}>{t(FORFAITS[f].nom)}</option>
                ))}
              </select>
            </label>
            <BoutonEnvoi className={bouton} enCours={t("Enregistrement…")}>{t("Appliquer")}</BoutonEnvoi>
          </form>
        )}
      </section>
    </>
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu params={params} searchParams={searchParams} />
    </Suspense>
  );
}
