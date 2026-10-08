import Link from "next/link";
import { Suspense } from "react";
import TableBailleurs from "@/components/TableBailleurs";
import { listerBailleurs, type FiltreBailleur } from "@/lib/admin";

type Params = { q?: string; filtre?: string };
const ONGLETS: [FiltreBailleur, string][] = [["tous", "Tous"], ["payant", "Payants"], ["essai", "Essais"], ["expire", "Expirés"]];

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
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
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Bailleurs</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{toutes.length} compte{toutes.length > 1 ? "s" : ""} sur la plateforme.</p>
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
                {l} ({compte(f)})
              </Link>
            ))}
          </div>
          <form className="relative">
            <input type="hidden" name="filtre" value={filtre} />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input name="q" defaultValue={q} placeholder="Nom ou téléphone…" className="h-11 pl-10 pr-4 rounded-xl bg-surface-container-low font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" />
          </form>
        </div>
        <TableBailleurs lignes={lignes} />
      </section>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="font-body-md text-body-md">Chargement…</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
