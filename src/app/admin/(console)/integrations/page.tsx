import Chargement from "@/components/Chargement";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { exigerAdmin } from "@/lib/admin";
import { diagnostic, resteABrancher } from "@/lib/integrations";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Intégrations")) };
}

const ETAT = {
  ok: { libelle: N_("En place"), classe: "bg-success-container text-on-success-container", icone: "check_circle" },
  attention: { libelle: N_("À surveiller"), classe: "bg-secondary-fixed text-on-secondary-fixed", icone: "warning" },
  manque: { libelle: N_("À brancher"), classe: "bg-error-container text-on-error-container", icone: "error" },
} as const;

async function Contenu() {
  const { t } = await getT();
  await exigerAdmin(); // l'état des services n'est calculé qu'après la vérification
  const baseJoignable = await db.$queryRaw`SELECT 1`.then(() => true, () => false);
  const lignes = diagnostic(process.env, baseJoignable);
  const reste = resteABrancher(lignes);

  return (
    <>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Intégrations")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("L'état de chaque service dont Nuuf dépend. Les valeurs des clés ne sont jamais affichées.")}</p>
      </div>
      <p className={`rounded-xl px-space-md py-3 font-body-md text-body-md ${reste === 0 ? "bg-success-container text-on-success-container" : "bg-secondary-fixed text-on-secondary-fixed"}`}>
        {reste === 0 ? t("Tout ce qui bloque l'ouverture à de vrais clients est en place.") : t("{n} point(s) bloquant(s) restent à régler avant d'ouvrir à de vrais clients.", { n: reste })}
      </p>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {lignes.map((i) => {
          const e = ETAT[i.etat];
          return (
            <li key={i.code} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t(i.nom)}</h2>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${e.classe}`}>
                  <span className="material-symbols-outlined text-[16px]">{e.icone}</span>
                  {t(e.libelle)}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{t(i.detail, i.vars)}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <code className="font-mono">{i.variables.join(" · ")}</code>
                {i.bloquant ? ` — ${t("bloquant pour l'ouverture")}` : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu />
    </Suspense>
  );
}
