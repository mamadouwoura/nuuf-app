import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import TableBailleurs from "@/components/TableBailleurs";
import { listerBailleurs, type FiltreBailleur } from "@/lib/admin";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Administration - Bailleurs")) };
}

type Params = { q?: string; filtre?: string };
const ONGLETS: [FiltreBailleur, string][] = [["tous", N_("Tous")], ["payant", N_("Payants")], ["essai", N_("Essais")], ["expire", N_("Expirés")]];

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t, tn } = await getT();
  const { q, filtre = "tous" } = await searchParams;
  const toutes = await listerBailleurs();
  const lignes = toutes.filter(
    (l) =>
      (filtre === "tous" || l.categorie === filtre) &&
      (!q || `${l.nom} ${l.proprio?.telephone ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );
  const compte = (f: FiltreBailleur) => (f === "tous" ? toutes.length : toutes.filter((l) => l.categorie === f).length);

  return (
    <>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Bailleurs")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{tn(toutes.length, "{n} compte sur la plateforme.", "{n} comptes sur la plateforme.")}</p>
      </div>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm">
        <div className="p-space-lg flex flex-col lg:flex-row gap-space-md lg:items-center justify-between">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low self-start">
            {ONGLETS.map(([f, l]) => (
              <Link
                key={f}
                href={`/admin/bailleurs?filtre=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md ${filtre === f ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                {t(l)} ({compte(f)})
              </Link>
            ))}
          </div>
          <form className="relative">
            <input type="hidden" name="filtre" value={filtre} />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input name="q" defaultValue={q} placeholder={t("Nom ou téléphone…")} className="h-11 pl-10 pr-4 rounded-xl bg-surface-container-low font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" />
          </form>
        </div>
        <TableBailleurs lignes={lignes} />
      </section>
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
