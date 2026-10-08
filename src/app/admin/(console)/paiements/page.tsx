import Link from "next/link";
import { Suspense } from "react";
import type { StatutPaiement } from "@prisma/client";
import { db } from "@/lib/db";
import { exigerAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Paiements")) };
}

type Params = { statut?: string };
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: N_("Espèces"), VIREMENT: N_("Virement") } as const;
const STATUT = {
  CONFIRME: [N_("Confirmé"), "bg-success-container text-on-success-container"],
  INITIE: [N_("En cours"), "bg-secondary-fixed text-on-secondary-fixed"],
  ECHEC: [N_("Échec"), "bg-error-container text-on-error-container"],
  EXPIRE: [N_("Expiré"), "bg-surface-container-high text-on-surface-variant"],
} as const;

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t, locale } = await getT();
  await exigerAdmin(); // les données ne sont lues qu'après la vérification
  const { statut } = await searchParams;
  const filtre = statut && statut in STATUT ? (statut as StatutPaiement) : undefined;
  const paiements = await db.paiement.findMany({
    where: filtre ? { statut: filtre } : {},
    orderBy: { creeLe: "desc" },
    take: 50,
    include: { quittance: true, echeance: { include: { bail: { include: { locataire: true, bien: { include: { organisation: true } } } } } } },
  });

  return (
    <>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Paiements")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Les 50 dernières transactions de loyers, tous bailleurs confondus.")}</p>
      </div>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low self-start">
          {[["", t("Tous")], ["CONFIRME", t("Confirmés")], ["INITIE", t("En cours")], ["ECHEC", t("Échecs")]].map(([v, l]) => (
            <Link key={v} href={v ? `/admin/paiements?statut=${v}` : "/admin/paiements"} className={`px-3 py-1.5 rounded-lg font-label-md text-label-md ${(statut ?? "") === v ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container"}`}>
              {l}
            </Link>
          ))}
        </div>
        {paiements.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune transaction.")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-space-md">{t("Date")}</th>
                  <th className="py-3 px-space-md">{t("Bailleur / locataire")}</th>
                  <th className="py-3 px-space-md">{t("Canal")}</th>
                  <th className="py-3 px-space-md">{t("Référence")}</th>
                  <th className="py-3 px-space-md">{t("Statut")}</th>
                  <th className="py-3 px-space-md text-right">{t("Montant")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                {paiements.map((p) => {
                  const [lib, cls] = STATUT[p.statut];
                  const org = p.echeance.bail.bien.organisation.nom;
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-space-md text-on-surface-variant">{formaterDate(p.creeLe, locale, { day: "2-digit", month: "short" })} {formaterDate(p.creeLe, locale, { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="py-3 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{org}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{p.echeance.bail.locataire.nomComplet}</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md">{t(CANAL[p.canal])}</td>
                      <td className="py-3 px-space-md font-mono text-[12px] text-on-surface-variant">{p.referenceOperateur ?? p.quittance?.numero ?? "—"}</td>
                      <td className="py-3 px-space-md"><span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${cls}`}>{t(lib)}</span></td>
                      <td className="py-3 px-space-md text-right font-label-lg text-label-lg font-bold text-primary">{fcfa(p.montant)} FCFA</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="font-body-md text-body-md">{t("Chargement…")}</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
