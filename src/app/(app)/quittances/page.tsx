import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { partagerQuittance } from "@/app/actions/messages";
import { db } from "@/lib/db";
import { fcfa, initiales } from "@/lib/immo";
import { cleMois, debutMois, depuisCle, libelleMois, moisPrecedent } from "@/lib/loyers";
import { getUser } from "@/lib/session";

type Params = { mois?: string };
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { mois: cle } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const now = new Date();
  const mois = depuisCle(cle, now);
  const suivant = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth() + 1, 1));

  const [quittances, partages] = await Promise.all([
    db.quittance.findMany({
      where: { organisationId: orgId, emiseLe: { gte: mois, lt: suivant } },
      orderBy: { emiseLe: "desc" },
      include: { paiement: { include: { echeance: { include: { bail: { include: { locataire: true, bien: true } } } } } } },
    }),
    db.journalAction.findMany({ where: { organisationId: orgId, action: "quittance.partagee" }, select: { cible: true } }),
  ]);
  const transmises = new Set(partages.map((p) => p.cible));
  const nbTransmises = quittances.filter((q) => transmises.has(q.id)).length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-space-xs">
            <Link href={`/quittances?mois=${cleMois(moisPrecedent(mois))}`} className="w-9 h-9 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </Link>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">{libelleMois(mois)}</span>
            {suivant <= debutMois(now) && (
              <Link href={`/quittances?mois=${cleMois(suivant)}`} className="w-9 h-9 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-surface-container">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </Link>
            )}
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Quittances</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {quittances.length} quittance{quittances.length > 1 ? "s" : ""} émise{quittances.length > 1 ? "s" : ""} • {libelleMois(mois)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold self-start">
          <span className="material-symbols-outlined text-[16px]">verified</span> Vérifiables par QR code
        </span>
      </div>

      <section className="grid grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Toutes</span>
          <div className="font-headline-md text-headline-md text-primary font-bold">{quittances.length}</div>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Envoyées WhatsApp</span>
          <div className="font-headline-md text-headline-md text-primary font-bold">{nbTransmises}</div>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Non transmises</span>
          <div className="font-headline-md text-headline-md text-secondary font-bold">{quittances.length - nbTransmises}</div>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">receipt_long</span> Registre des quittances
        </h2>
        {quittances.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            Aucune quittance ce mois. Elles sont émises automatiquement à chaque loyer encaissé.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {quittances.map((q) => {
              const loc = q.paiement.echeance.bail.locataire;
              const envoyee = transmises.has(q.id);
              return (
                <div key={q.id} className="py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-3 lg:w-2/5">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(loc.nomComplet)}</div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{loc.nomComplet}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{q.numero} • {q.paiement.echeance.bail.bien.designation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md lg:w-1/4">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(q.paiement.montant)} FCFA</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{CANAL[q.paiement.canal]}</span>
                  </div>
                  <div className="flex items-center gap-2 lg:w-1/3 lg:justify-end">
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${envoyee ? "bg-emerald-50 text-emerald-800" : "bg-secondary-fixed text-on-secondary-fixed-variant"}`}>
                      {envoyee ? "Envoyée" : "Non transmise"}
                    </span>
                    <a href={`/quittances/${q.id}/pdf`} target="_blank" className="inline-flex items-center gap-1 h-10 px-3 rounded-xl bg-surface hover:bg-surface-container text-primary font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[18px]">download</span> PDF
                    </a>
                    <form action={partagerQuittance}>
                      <input type="hidden" name="id" value={q.id} />
                      <button className="inline-flex items-center gap-1 h-10 px-3 rounded-xl bg-[#d3f3e2] hover:bg-[#bfe9d3] text-[#0b3d2e] font-label-md text-label-md font-semibold">
                        <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
