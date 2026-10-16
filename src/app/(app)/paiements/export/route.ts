import { assurerEcheances, cleMois, debutMois, depuisCle, loyersDuMois } from "@/lib/loyers";
import { refuseSiModule } from "@/lib/permissions";

const ETAT = { PAYE: "Payé", EN_ATTENTE: "En attente", EN_RETARD: "En retard" } as const;
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

// Une cellule commençant par = + - @ serait interprétée comme une formule par Excel.
const cellule = (v: string | number) => {
  const t = String(v);
  const sur = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t;
  return `"${sur.replace(/"/g, '""')}"`;
};

/** Export Excel (CSV, séparateur « ; », UTF-8 avec BOM) des loyers d'un mois. */
export async function GET(req: Request) {
  const { user, reponse } = await refuseSiModule("LOYERS");
  if (reponse || !user) return reponse ?? new Response("Non autorisé", { status: 401 });
  const orgId = user.membres[0].organisationId;
  const now = new Date();
  const mois = depuisCle(new URL(req.url).searchParams.get("mois") ?? undefined, now);
  if (mois <= debutMois(now)) await assurerEcheances(orgId, mois);
  const m = await loyersDuMois(orgId, mois, now);

  const lignes = [
    ["Locataire", "Téléphone", "Bien", "Échéance", "Loyer dû (FCFA)", "Reçu (FCFA)", "Reste (FCFA)", "État", "Canal", "Quittance"],
    ...m.lignes.map((l) => [
      l.bail.locataire.nomComplet,
      l.bail.locataire.telephone.replace(/[^0-9]/g, ""),
      l.bail.bien.designation,
      l.dateLimite.toISOString().slice(0, 10),
      l.montantDu,
      l.paye,
      l.reste,
      ETAT[l.etat],
      l.paiements[0] ? CANAL[l.paiements[0].canal] : "",
      l.paiements[0]?.quittance?.numero ?? "",
    ]),
  ];
  const corps = "﻿" + lignes.map((r) => r.map(cellule).join(";")).join("\r\n");
  return new Response(corps, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nuuf-loyers-${cleMois(mois)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
