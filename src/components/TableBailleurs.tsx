import { FORFAITS } from "@/lib/forfaits";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import type { LigneBailleur } from "@/lib/admin";

const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const FORFAIT_CLASSE = {
  DECOUVERTE: "bg-surface-container-high text-on-surface-variant",
  BAILLEUR: "bg-surface-container-high text-primary",
  PRO: "bg-primary-fixed text-on-primary-fixed",
  AGENCE: "bg-primary text-on-primary",
} as const;

function statut(l: LigneBailleur) {
  if (l.categorie === "payant") return { t: "Payant", c: "bg-success-container text-on-success-container", i: "check_circle" };
  if (l.categorie === "essai") return { t: `Essai (${l.acces.joursRestants} j restants)`, c: "bg-secondary-fixed text-on-secondary-fixed", i: "hourglass_top" };
  return { t: l.acces.etat === "GRACE" ? "Paiement en retard" : "Expiré", c: "bg-error-container text-on-error-container", i: "error" };
}

export default function TableBailleurs({ lignes }: { lignes: LigneBailleur[] }) {
  if (lignes.length === 0) return <p className="font-body-md text-body-md text-on-surface-variant p-space-lg">Aucun bailleur ne correspond.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            <th className="py-3 px-space-md">Bailleur / contact</th>
            <th className="py-3 px-space-md">Forfait</th>
            <th className="py-3 px-space-md">Logements</th>
            <th className="py-3 px-space-md">Inscription</th>
            <th className="py-3 px-space-md">Statut</th>
            <th className="py-3 px-space-md text-right">MRR</th>
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
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{l.nom}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{l.proprio ? telAffiche(l.proprio.telephone) : "—"}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-space-md">
                  <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${FORFAIT_CLASSE[l.forfait]}`}>{FORFAITS[l.forfait].nom}</span>
                </td>
                <td className="py-3 px-space-md">{l.logements}</td>
                <td className="py-3 px-space-md text-on-surface-variant">{dateFr(l.creeLe)}</td>
                <td className="py-3 px-space-md">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${s.c}`}>
                    <span className="material-symbols-outlined text-[15px]">{s.i}</span>
                    {s.t}
                  </span>
                </td>
                <td className="py-3 px-space-md text-right font-label-lg text-label-lg font-bold text-primary">{l.mrr ? `${fcfa(l.mrr)} FCFA` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
