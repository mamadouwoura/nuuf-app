"use client";

import { useActionState } from "react";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { rechercherCandidat, type EtatRecherche } from "@/app/actions/historique";
import { useT } from "@/lib/i18n/client";
import { formaterDate } from "@/lib/i18n/format";
import { TYPE_LIBELLE } from "@/lib/immo";
import { APPRECIATION, CLES_APPRECIATION, MOTIFS_FIN, libelleAppreciation } from "@/lib/motifs";

const pct = (a: number, n: number) => (n ? `${Math.round((a / n) * 100)} %` : "—");

export default function RechercheHistorique() {
  const { t, tn, locale } = useT();
  const [etat, action] = useActionState<EtatRecherche, FormData>(rechercherCandidat, null);
  const r = etat?.resultat;
  const mois = (iso: string) => formaterDate(new Date(iso), locale, { month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <form action={action} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div>
          <label htmlFor="telephone" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">
            {t("Numéro de téléphone du candidat")}
          </label>
          <div className="flex rounded-xl bg-surface-container-low focus-within:ring-2 focus-within:ring-primary-container">
            <span className="flex items-center pl-3.5 pr-2 font-label-lg text-label-lg text-on-surface font-semibold select-none">+221</span>
            <input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="off" placeholder="77 000 00 00" className="w-full h-12 px-2 bg-transparent text-on-surface placeholder:text-outline outline-none" />
          </div>
        </div>
        <div>
          <label htmlFor="cni" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">
            {t("Numéro de pièce d'identité (CNI / passeport)")}
          </label>
          <input id="cni" name="cni" autoComplete="off" placeholder="1 234 5678 90123" className="w-full h-12 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container outline-none" />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Indiquez l'un des deux, ou les deux pour une recherche plus sûre.")}</p>
        </div>
        <label className="flex items-start gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
          <input type="checkbox" name="accord" required className="mt-0.5 w-5 h-5 accent-primary" />
          <span className="font-body-md text-body-md text-on-surface">{t("Le candidat m'a donné son accord pour que je consulte son historique locatif.")}</span>
        </label>
        {etat?.erreur && (
          <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">
            {etat.erreur}
          </p>
        )}
        <BoutonEnvoi enCours={t("Recherche…")} className="h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 sm:self-start">
          <span className="material-symbols-outlined text-[20px]">manage_search</span>
          {t("Vérifier l'historique")}
        </BoutonEnvoi>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t("Seuls les locataires ayant consenti à l'enregistrement de leur historique apparaissent. Chaque recherche est enregistrée.")}
        </p>
      </form>

      {etat && !etat.erreur && !r && (
        <div role="status" className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-[28px] text-on-surface-variant">search_off</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Aucun historique partagé")}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {t("Ce numéro n'a pas d'historique consenti chez d'autres agences ou bailleurs Nuuf. Ce n'est ni bon ni mauvais signe : demandez les justificatifs habituels.")}
            </p>
          </div>
        </div>
      )}

      {r && (
        <section className="flex flex-col gap-space-md" aria-live="polite">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{r.nom}</h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{tn(r.dossiers.length, "{n} location enregistrée", "{n} locations enregistrées")}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="rounded-xl bg-primary text-on-primary p-3">
                <p className="font-body-sm text-body-sm opacity-80">{t("Ponctualité")}</p>
                <p className="font-headline-sm text-headline-sm font-bold">{pct(r.aTemps, r.echeances)}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Loyers à temps")}</p>
                <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{r.aTemps}/{r.echeances}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Réglés en retard")}</p>
                <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{r.enRetard}</p>
              </div>
              <div className={`rounded-xl p-3 ${r.impayes ? "bg-error-container text-on-error-container" : "bg-surface-container-low"}`}>
                <p className="font-body-sm text-body-sm opacity-80">{t("Impayés")}</p>
                <p className="font-headline-sm text-headline-sm font-bold">{r.impayes}</p>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-space-sm">
            {r.dossiers.map((d, i) => {
              const motif = MOTIFS_FIN.find((m) => m.code === d.motifFin);
              return (
                <li key={i} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">{d.agence}</span>
                    {d.nom !== r.nom && <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Enregistré sous : {nom}", { nom: d.nom })}</span>}
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${d.enCours ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
                      {d.enCours ? t("En cours") : t("Terminée")}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {t(TYPE_LIBELLE[d.type as keyof typeof TYPE_LIBELLE] ?? TYPE_LIBELLE.APPARTEMENT)} · {d.quartier}, {d.ville}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {mois(d.debut)} → {d.fin ? mois(d.fin) : t("aujourd'hui")}
                    {motif ? ` · ${t(motif.libelle)}` : ""}
                  </p>
                  {d.appreciation && CLES_APPRECIATION.some((c) => d.appreciation![c]) && (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CLES_APPRECIATION.map((c) => {
                        const lib = libelleAppreciation(c, d.appreciation![c]);
                        if (!lib) return null;
                        return (
                          <div key={c} className="rounded-lg bg-surface-container-low px-3 py-2">
                            <dt className="font-body-sm text-[11px] text-on-surface-variant">{t(APPRECIATION[c].titre)}</dt>
                            <dd className="font-label-md text-label-md font-semibold text-on-surface">{t(lib)}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-success-container text-on-success-container font-label-md text-label-md font-bold">{t("{n} à temps", { n: d.aTemps })}</span>
                    {d.enRetard > 0 && <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold">{t("{n} en retard", { n: d.enRetard })}</span>}
                    {d.impayes > 0 && <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">{t("{n} impayé(s)", { n: d.impayes })}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t("Informations déclarées par les autres agences et calculées d'après leurs paiements enregistrés dans Nuuf. Elles aident à apprécier une candidature : elles ne remplacent pas un échange avec le candidat.")}
          </p>
        </section>
      )}
    </div>
  );
}
