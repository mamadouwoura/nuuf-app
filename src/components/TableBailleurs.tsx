import Link from "next/link";
import { FORFAITS } from "@/lib/forfaits";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import type { LigneBailleur } from "@/lib/admin";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";
import { formaterDate } from "@/lib/i18n/format";

const FORFAIT_CLASSE = {
  DECOUVERTE: "bg-surface-container-high text-on-surface-variant",
  BAILLEUR: "bg-surface-container-high text-primary",
  PRO: "bg-primary-fixed text-on-primary-fixed",
  AGENCE: "bg-primary text-on-primary",
} as const;

function statut(l: LigneBailleur) {
  if (l.categorie === "payant") return { t: N_("Payant"), c: "bg-success-container text-on-success-container", i: "check_circle" };
  if (l.categorie === "essai") return { t: N_("Essai ({n} j restants)"), n: l.acces.joursRestants, c: "bg-secondary-fixed text-on-secondary-fixed", i: "hourglass_top" };
  return { t: l.acces.etat === "GRACE" ? N_("Paiement en retard") : N_("Expiré"), c: "bg-error-container text-on-error-container", i: "error" };
}

export default async function TableBailleurs({ lignes }: { lignes: LigneBailleur[] }) {
  const { t, locale } = await getT();
  const dateFr = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "short", year: "numeric" });
  if (lignes.length === 0) return <p className="font-body-md text-body-md text-on-surface-variant p-space-lg">{t("Aucun bailleur ne correspond.")}</p>;
  return (
    <>
    <ul className="md:hidden flex flex-col gap-3">
      {lignes.map((l) => {
        const s = statut(l);
        return (
          <li key={l.id} className="rounded-2xl bg-surface-container-low p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(l.nom)}</div>
              <div className="flex flex-col min-w-0">
                <Link href={`/admin/bailleurs/${l.id}`} className="font-label-lg text-label-lg text-primary font-semibold truncate">{l.nom}</Link>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{l.proprio ? telAffiche(l.proprio.telephone) : "—"}</span>
              </div>
              <span className={`ml-auto shrink-0 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${FORFAIT_CLASSE[l.forfait]}`}>{t(FORFAITS[l.forfait].nom)}</span>
            </div>
            <span className={`self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${s.c}`}>
              <span className="material-symbols-outlined text-[15px]">{s.i}</span>
              {t(s.t, { n: "n" in s ? (s.n ?? 0) : 0 })}
            </span>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-container-lowest py-2"><dt className="font-body-sm text-[11px] text-on-surface-variant">{t("Logements")}</dt><dd className="font-label-lg text-label-lg font-bold text-on-surface">{l.logements}</dd></div>
              <div className="rounded-xl bg-surface-container-lowest py-2"><dt className="font-body-sm text-[11px] text-on-surface-variant">{t("Inscription")}</dt><dd className="font-label-md text-label-md font-semibold text-on-surface">{dateFr(l.creeLe)}</dd></div>
              <div className="rounded-xl bg-surface-container-lowest py-2"><dt className="font-body-sm text-[11px] text-on-surface-variant">{t("MRR")}</dt><dd className="font-label-md text-label-md font-bold text-primary">{l.mrr ? fcfa(l.mrr) : "—"}</dd></div>
            </dl>
          </li>
        );
      })}
    </ul>
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            <th className="py-3 px-space-md">{t("Bailleur / contact")}</th>
            <th className="py-3 px-space-md">{t("Forfait")}</th>
            <th className="py-3 px-space-md">{t("Logements")}</th>
            <th className="py-3 px-space-md">{t("Inscription")}</th>
            <th className="py-3 px-space-md">{t("Statut")}</th>
            <th className="py-3 px-space-md text-right">{t("MRR")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {lignes.map((l) => {
            const s = statut(l);
            return (
              <tr key={l.id} className="font-body-md text-body-md">
                <td className="py-3 px-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(l.nom)}</div>
                    <div className="flex flex-col">
                      <Link href={`/admin/bailleurs/${l.id}`} className="font-label-lg text-label-lg text-primary font-semibold">{l.nom}</Link>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{l.proprio ? telAffiche(l.proprio.telephone) : "—"}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-space-md">
                  <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${FORFAIT_CLASSE[l.forfait]}`}>{t(FORFAITS[l.forfait].nom)}</span>
                </td>
                <td className="py-3 px-space-md">{l.logements}</td>
                <td className="py-3 px-space-md text-on-surface-variant">{dateFr(l.creeLe)}</td>
                <td className="py-3 px-space-md">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${s.c}`}>
                    <span className="material-symbols-outlined text-[15px]">{s.i}</span>
                    {t(s.t, { n: "n" in s ? (s.n ?? 0) : 0 })}
                  </span>
                </td>
                <td className="py-3 px-space-md text-right font-label-lg text-label-lg font-bold text-primary">{l.mrr ? `${fcfa(l.mrr)} FCFA` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
