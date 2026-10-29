import Link from "next/link";
import { Suspense } from "react";
import Reveal from "@/components/accueil/Reveal";
import TarifsAccueil from "@/components/TarifsAccueil";
import { PublicFooter, PublicHeader, lienContact } from "@/components/PublicLayout";
import { prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";
import { PLANS } from "@/lib/plans-publics";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Tarifs")) };
}

const LIGNES: [string, string, string, string][] = [
  [N_("Logements inclus"), "15", "50", N_("Illimité")],
  [N_("Accès utilisateurs"), "1", "5", "15"],
  [N_("Encaissement Wave & Orange Money"), "✓", "✓", "✓"],
  [N_("Paiements partiels et espèces"), "✓", "✓", "✓"],
  [N_("Quittances PDF + QR code de vérification"), "✓", "✓", "✓"],
  [N_("Relances WhatsApp"), "✓", "✓", "✓"],
  [N_("Rôles et journal d'équipe"), "—", "✓", "✓"],
];

async function Contenu() {
  const { t } = await getT();
  const plans = PLANS.map((p) => ({
    code: p.code,
    nom: t(p.nom),
    pour: t(p.pour),
    logements: t(p.logements),
    vedette: p.vedette,
    points: p.points.map((x) => t(x)),
    prixMensuel: fcfa(prixMensuel(p.code, 0)),
    prixAnnuel: fcfa(prixAnnuel(p.code, 0)),
    note: p.code === "AGENCE" ? t("jusqu'à 20 logements, puis 24 900 FCFA jusqu'à 50") : undefined,
  }));
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-20 px-5 pb-8 pt-28 sm:pt-32">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-surface-container-low px-4 py-1.5 font-label-md text-label-md font-semibold text-primary ring-1 ring-outline-variant/50">{t("Tarifs transparents")}</span>
        <h1 className="max-w-3xl text-balance font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface text-[clamp(2.3rem,6vw,4.4rem)]">{t("Un prix simple, selon votre nombre de logements")}</h1>
        <p className="max-w-2xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
          {t("14 jours d'essai gratuit, sans carte bancaire. Sans engagement. Aucun pourcentage n'est prélevé sur vos loyers.")}
        </p>
      </header>

      <Reveal>
        <TarifsAccueil plans={plans} />
      </Reveal>

      <Reveal>
        <section className="overflow-x-auto rounded-[2rem] bg-surface-container-lowest p-6 ring-1 ring-outline-variant/50 sm:p-8">
          <h2 className="mb-5 font-extrabold tracking-tight text-on-surface text-[1.6rem]">{t("Comparer les formules")}</h2>
          <ul className="flex flex-col gap-3 md:hidden">
            {LIGNES.map(([nom, a, b, c]) => (
              <li key={nom} className="rounded-2xl bg-surface-container-low p-3">
                <p className="mb-2 font-label-lg text-label-lg font-semibold text-on-surface">{t(nom)}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[[t("Bailleur"), a], ["Pro", b], [t("Agence"), c]].map(([plan, v]) => (
                    <div key={plan} className="rounded-xl bg-surface-container-lowest px-1 py-1.5">
                      <p className="font-body-sm text-[11px] text-on-surface-variant">{plan}</p>
                      <p className={`font-label-md text-label-md ${v === "✓" ? "font-bold text-primary" : "text-on-surface-variant"}`}>{t(v)}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 pr-4">{t("Fonctionnalité")}</th>
                <th className="px-4 py-3">{t("Bailleur")}</th>
                <th className="px-4 py-3">Pro</th>
                <th className="px-4 py-3">{t("Agence")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-md text-body-md">
              {LIGNES.map(([nom, a, b, c]) => (
                <tr key={nom}>
                  <td className="py-3 pr-4 text-on-surface">{t(nom)}</td>
                  {[a, b, c].map((v, i) => (
                    <td key={i} className={`px-4 py-3 ${v === "✓" ? "font-bold text-primary" : "text-on-surface-variant"}`}>{t(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Reveal>

      <Reveal>
        <section className="nf-hero relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:py-20">
          <div className="nf-blob nf-blob-a" aria-hidden="true" />
          <div className="nf-blob nf-blob-b" aria-hidden="true" />
          <h2 className="relative mx-auto max-w-2xl text-balance font-extrabold leading-[1.04] tracking-[-0.035em] text-[clamp(1.9rem,4.4vw,3.2rem)]">{t("Une question avant de vous lancer ?")}</h2>
          <p className="relative mx-auto mt-4 max-w-md font-body-lg text-body-lg text-white/70">{t("Réglez par Wave ou Orange Money. Résiliable à tout moment.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/inscription" className="inline-flex h-14 items-center rounded-full bg-white px-8 font-label-lg text-label-lg font-bold text-[#082d23]">{t("Commencer gratuitement")}</Link>
            <a href={lienContact} target={lienContact.startsWith("http") ? "_blank" : undefined} rel="noopener" className="inline-flex h-14 items-center rounded-full bg-white/10 px-8 font-label-lg text-label-lg font-semibold text-white ring-1 ring-white/25 hover:bg-white/15">{t("Parler à un conseiller")}</a>
          </div>
        </section>
      </Reveal>
    </main>
  );
}

export default function Page() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <PublicHeader actif="tarifs" />
      <Suspense fallback={<main className="min-h-screen pt-28" />}>
        <Contenu />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
