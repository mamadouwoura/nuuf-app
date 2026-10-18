import BoutonEnvoi from "@/components/BoutonEnvoi";
import { creerAvenant } from "@/app/actions/avenants";
import { db } from "@/lib/db";
import { CLAUSE_MAX, CLAUSE_MIN, LIBELLE_AVENANT, type TypeAvenant } from "@/lib/avenants";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";

const CHAMP = "h-11 w-full px-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container";
const BOUTON = "h-11 px-5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold self-start";

/** Contrat d'origine et avenants d'un bail : liste des documents (PDF) et formulaires d'ajout. */
export default async function SectionAvenants({ bienId, bailId, debutLe, peutEcrire }: { bienId: string; bailId: string; debutLe: Date; peutEcrire: boolean }) {
  const { t, locale } = await getT();
  const avenants = await db.avenant.findMany({ where: { bailId }, orderBy: { numero: "asc" } });
  const date = (d: Date) => formaterDate(d, locale);
  const resume = (a: (typeof avenants)[number]) => {
    if (a.type === "LOYER") return t("{ancien} → {nouveau} FCFA / mois, à partir de {date}", { ancien: fcfa(a.ancienLoyer ?? 0), nouveau: fcfa(a.nouveauLoyer ?? 0), date: formaterDate(a.effetLe, locale, { month: "long", year: "numeric" }) });
    if (a.type === "DUREE") return t("Fin du bail au {date}", { date: a.nouvelleFinLe ? date(a.nouvelleFinLe) : "—" });
    return a.clause ?? "";
  };
  const lien = "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold hover:bg-surface-container-high";
  const bloc = "rounded-2xl bg-surface-container-low";
  const titre = "flex items-center justify-between gap-3 cursor-pointer list-none px-space-md py-3 font-label-lg text-label-lg font-bold text-on-surface";

  return (
    <section id="avenants" className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md scroll-mt-24">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Contrat et avenants")}</h2>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant">{t("Le contrat d'origine reste inchangé. Chaque modification (loyer, durée, clause) fait l'objet d'un avenant numéroté, à faire signer par les deux parties.")}</p>

      <ul className="flex flex-col divide-y divide-surface-container">
        <li className="py-3 flex flex-wrap items-center justify-between gap-3">
          <span>
            <span className="block font-label-lg text-label-lg font-semibold text-on-surface">{t("Contrat de location")}</span>
            <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("Prise d'effet le {date}", { date: date(debutLe) })}</span>
          </span>
          <a href={`/biens/${bienId}/contrat`} target="_blank" className={lien}>
            <span className="material-symbols-outlined text-[18px]">description</span>PDF
          </a>
        </li>
        {avenants.map((a) => (
          <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-label-lg text-label-lg font-semibold text-on-surface">{t("Avenant n° {n}", { n: a.numero })} · {t(LIBELLE_AVENANT[a.type as TypeAvenant] ?? "")}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant">{resume(a)}</span>
              <span className="block text-[11px] text-on-surface-variant">{t("Enregistré le {date}", { date: date(a.creeLe) })}</span>
            </span>
            <a href={`/biens/${bienId}/avenants/${a.numero}`} target="_blank" className={lien}>
              <span className="material-symbols-outlined text-[18px]">description</span>PDF
            </a>
          </li>
        ))}
      </ul>

      {peutEcrire && (
        <div className="flex flex-col gap-2">
          <details className={bloc}>
            <summary className={titre}>{t("Changer le loyer")}<span className="material-symbols-outlined text-[20px]">add</span></summary>
            <form action={creerAvenant} className="px-space-md pb-space-md flex flex-col gap-3">
              <input type="hidden" name="bienId" value={bienId} />
              <input type="hidden" name="type" value="LOYER" />
              <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="av-loyer">{t("Nouveau loyer mensuel (FCFA)")}
                <input id="av-loyer" name="loyer" inputMode="numeric" required autoComplete="off" className={CHAMP} />
              </label>
              <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="av-effet">{t("À partir de")}
                <select id="av-effet" name="effet" defaultValue="suivant" className={CHAMP}>
                  <option value="courant">{t("Ce mois-ci")}</option>
                  <option value="suivant">{t("Le mois prochain")}</option>
                </select>
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Le nouveau loyer s'applique aux échéances à venir non encore réglées. Les loyers passés ne changent pas.")}</p>
              <BoutonEnvoi className={BOUTON} enCours={t("Enregistrement…")}>{t("Enregistrer l'avenant")}</BoutonEnvoi>
            </form>
          </details>
          <details className={bloc}>
            <summary className={titre}>{t("Prolonger ou changer la durée")}<span className="material-symbols-outlined text-[20px]">add</span></summary>
            <form action={creerAvenant} className="px-space-md pb-space-md flex flex-col gap-3">
              <input type="hidden" name="bienId" value={bienId} />
              <input type="hidden" name="type" value="DUREE" />
              <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="av-fin">{t("Nouvelle date de fin du bail")}
                <input id="av-fin" name="finLe" type="date" required className={CHAMP} />
              </label>
              <BoutonEnvoi className={BOUTON} enCours={t("Enregistrement…")}>{t("Enregistrer l'avenant")}</BoutonEnvoi>
            </form>
          </details>
          <details className={bloc}>
            <summary className={titre}>{t("Ajouter une clause")}<span className="material-symbols-outlined text-[20px]">add</span></summary>
            <form action={creerAvenant} className="px-space-md pb-space-md flex flex-col gap-3">
              <input type="hidden" name="bienId" value={bienId} />
              <input type="hidden" name="type" value="CLAUSE" />
              <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant" htmlFor="av-clause">{t("Texte de la clause")}
                <textarea id="av-clause" name="clause" required minLength={CLAUSE_MIN} maxLength={CLAUSE_MAX} rows={4} className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" />
              </label>
              <BoutonEnvoi className={BOUTON} enCours={t("Enregistrement…")}>{t("Enregistrer l'avenant")}</BoutonEnvoi>
            </form>
          </details>
        </div>
      )}
    </section>
  );
}
