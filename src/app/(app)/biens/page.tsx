import Link from "next/link";
import Pagination, { decouper, numeroPage } from "@/components/Pagination";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { TypeBien } from "@prisma/client";
import { db } from "@/lib/db";
import { fcfa, initiales, statutLoyer, telMasque, TYPE_LIBELLE } from "@/lib/immo";
import { getUser } from "@/lib/session";

export const metadata = { title: "Mes biens" };

type Params = { q?: string; quartier?: string; type?: string; archive?: string; page?: string };

const BADGE = {
  PAYE: "bg-emerald-50 text-emerald-800",
  EN_ATTENTE: "bg-secondary-fixed text-on-secondary-fixed-variant",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  EN_RETARD: "bg-error-container text-on-error-container",
  VACANT: "bg-surface-container-high text-on-surface-variant",
} as const;
const ICONE = { PAYE: "check_circle", EN_ATTENTE: "hourglass_top", PARTIEL: "hourglass_top", EN_RETARD: "error", VACANT: "domain_disabled" } as const;

async function Liste({ searchParams }: { searchParams: Promise<Params> }) {
  const { q, quartier, type, archive, page: pageBrut } = await searchParams;
  const page = numeroPage(pageBrut);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const now = new Date();

  const tous = await db.bien.findMany({
    where: { organisationId: orgId, archiveLe: null },
    include: {
      baux: {
        where: { actif: true },
        include: { locataire: true, echeances: { orderBy: { mois: "desc" }, take: 1 } },
        take: 1,
      },
    },
    orderBy: { creeLe: "desc" },
  });

  const quartiers = [...new Set(tous.map((b) => b.quartier))].sort();
  const biens = tous.filter(
    (b) =>
      (!quartier || b.quartier === quartier) &&
      (!type || b.type === (type as TypeBien)) &&
      (!q || `${b.designation} ${b.quartier} ${b.baux[0]?.locataire.nomComplet ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  const occupes = tous.filter((b) => b.baux.length).length;
  const loyersTheoriques = tous.reduce((s, b) => s + (b.baux[0]?.loyerMensuel ?? 0), 0);

  return (
    <div className="flex flex-col w-full">
      {archive && <p className="rounded-xl bg-emerald-50 text-emerald-800 px-space-md py-2 mb-space-md font-body-md text-body-md">Bien archivé. L'historique et les quittances sont conservés.</p>}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              Portefeuille Actif
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Mes biens</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {tous.length} logement{tous.length > 1 ? "s" : ""} répertorié{tous.length > 1 ? "s" : ""} • Suivi des baux et encaissements en temps réel
          </p>
          <div className="flex flex-wrap items-center gap-space-md mt-space-md">
            <div className="flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">key</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Occupés :</span>
              <span className="font-label-lg text-label-lg text-primary font-bold">{occupes}</span>
            </div>
            <div className="flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-secondary">domain_disabled</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Vacant :</span>
              <span className="font-label-lg text-label-lg text-secondary font-bold">{tous.length - occupes}</span>
            </div>
            <div className="flex items-center gap-2 px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-primary-container">account_balance</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Loyers théoriques :</span>
              <span className="font-label-lg text-label-lg text-primary font-bold tracking-tight">{fcfa(loyersTheoriques)} FCFA</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm self-start xl:self-end">
          <Link
            href="/biens/nouveau"
            className="flex items-center gap-2 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-md font-label-lg text-label-lg font-bold"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            <span>Ajouter un bien</span>
          </Link>
        </div>
      </div>

      <form className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm mb-space-lg flex flex-col lg:flex-row gap-space-sm items-stretch lg:items-center">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            name="q"
            defaultValue={q}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
            placeholder="Rechercher par adresse, locataire..."
            type="text"
          />
        </div>
        <select
          name="quartier" aria-label="Filtrer par quartier"
          defaultValue={quartier ?? ""}
          className="h-11 pl-3.5 pr-9 rounded-xl bg-surface text-on-surface font-label-md text-label-md font-medium focus:outline-none focus:ring-2 focus:ring-primary-container"
        >
          <option value="">Tous les quartiers</option>
          {quartiers.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          name="type" aria-label="Filtrer par type de bien"
          defaultValue={type ?? ""}
          className="h-11 pl-3.5 pr-9 rounded-xl bg-surface text-on-surface font-label-md text-label-md font-medium focus:outline-none focus:ring-2 focus:ring-primary-container"
        >
          <option value="">Tous types</option>
          {Object.entries(TYPE_LIBELLE).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary transition-colors">
          Filtrer
        </button>
      </form>

      {biens.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col items-center text-center gap-space-sm">
          <span className="material-symbols-outlined text-[40px] text-primary">apartment</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {tous.length === 0 ? "Aucun bien pour le moment" : "Aucun bien ne correspond à ces filtres"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {tous.length === 0 ? "Ajoutez votre premier bien et son locataire pour commencer à encaisser." : "Modifiez votre recherche."}
          </p>
          {tous.length === 0 && (
            <Link href="/biens/nouveau" className="mt-space-sm inline-flex items-center gap-2 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
              Ajouter un bien
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-xl">
          {decouper(biens, page).map((b) => {
            const bail = b.baux[0];
            const st = statutLoyer(bail?.echeances[0], now);
            return (
              <div key={b.id} className="group flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[56px] text-on-primary-container opacity-70">
                    {b.type === "VILLA" ? "villa" : b.type === "COMMERCIAL" ? "storefront" : b.type === "STUDIO" ? "single_bed" : "apartment"}
                  </span>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-surface/95 backdrop-blur-md text-primary font-label-md text-label-md font-semibold shadow-sm">
                      {TYPE_LIBELLE[b.type]}
                      {b.surfaceM2 ? ` • ${b.surfaceM2} m²` : ""}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold shadow-sm ${BADGE[st.code]}`}>
                      <span className="material-symbols-outlined text-[15px]">{ICONE[st.code]}</span>
                      {st.libelle}
                    </span>
                  </div>
                  {bail && (
                    <div className="absolute bottom-3 left-3 text-on-primary">
                      <span className="font-label-md text-label-md opacity-90">Échéance le {String(bail.jourEcheance).padStart(2, "0")} du mois</span>
                    </div>
                  )}
                </div>
                <div className="p-space-lg flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">{b.designation}</h2>
                    <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>{b.quartier}</span>
                    </div>
                    <div className="mt-space-md pt-space-sm flex items-baseline justify-between bg-surface-container-low p-3 rounded-xl">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Loyer mensuel</span>
                      <div className="text-right">
                        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">{bail ? fcfa(bail.loyerMensuel) : "—"}</span>
                        <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant ml-1">FCFA/mois</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-space-md pt-space-md flex items-center justify-between gap-2">
                    {bail ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center font-bold">
                          {initiales(bail.locataire.nomComplet)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{bail.locataire.nomComplet}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{telMasque(bail.locataire.telephone)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person_off</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic">Aucun locataire</span>
                      </div>
                    )}
                    <Link href={`/biens/${b.id}`} className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container text-primary font-label-md text-label-md font-semibold transition-colors">
                      Gérer
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} total={biens.length} chemin="/biens" params={{ q, quartier, type }} />
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Liste searchParams={searchParams} />
    </Suspense>
  );
}
