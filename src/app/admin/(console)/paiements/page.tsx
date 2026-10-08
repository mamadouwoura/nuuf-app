import Link from "next/link";
import { Suspense } from "react";
import type { StatutPaiement } from "@prisma/client";
import { db } from "@/lib/db";
import { exigerAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/immo";

type Params = { statut?: string };
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;
const STATUT = {
  CONFIRME: ["Confirmé", "bg-emerald-50 text-emerald-800"],
  INITIE: ["En cours", "bg-secondary-fixed text-on-secondary-fixed"],
  ECHEC: ["Échec", "bg-error-container text-on-error-container"],
  EXPIRE: ["Expiré", "bg-surface-container-high text-on-surface-variant"],
} as const;

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
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
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Paiements</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Les 50 dernières transactions de loyers, tous bailleurs confondus.</p>
      </div>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low self-start">
          {[["", "Tous"], ["CONFIRME", "Confirmés"], ["INITIE", "En cours"], ["ECHEC", "Échecs"]].map(([v, l]) => (
            <Link key={v} href={v ? `/admin/paiements?statut=${v}` : "/admin/paiements"} className={`px-3 py-1.5 rounded-lg font-label-md text-label-md ${(statut ?? "") === v ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container"}`}>
              {l}
            </Link>
          ))}
        </div>
        {paiements.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Aucune transaction.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-space-md">Date</th>
                  <th className="py-3 px-space-md">Bailleur / locataire</th>
                  <th className="py-3 px-space-md">Canal</th>
                  <th className="py-3 px-space-md">Référence</th>
                  <th className="py-3 px-space-md">Statut</th>
                  <th className="py-3 px-space-md text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                {paiements.map((p) => {
                  const [lib, cls] = STATUT[p.statut];
                  const org = p.echeance.bail.bien.organisation.nom;
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-space-md text-on-surface-variant">{p.creeLe.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} {p.creeLe.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="py-3 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{org}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{p.echeance.bail.locataire.nomComplet}</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md">{CANAL[p.canal]}</td>
                      <td className="py-3 px-space-md font-mono text-[12px] text-on-surface-variant">{p.referenceOperateur ?? p.quittance?.numero ?? "—"}</td>
                      <td className="py-3 px-space-md"><span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${cls}`}>{lib}</span></td>
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

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="font-body-md text-body-md">Chargement…</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
