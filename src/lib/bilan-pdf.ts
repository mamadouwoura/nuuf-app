import { VERT, GRIS, dateFr, nombre, nouveauDocument } from "./pdf-outils";
import type { Bilan } from "./bilan";
import type { Identite } from "./identite";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const periode = (d: Date) => `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const f = (n: number) => `${n < 0 ? "-" : ""}${nombre(Math.abs(n))}`;

/** Compte rendu mensuel de gérance remis au propriétaire. */
export async function genererBilanPdf(b: Bilan, agence: Identite): Promise<Uint8Array> {
  const d = await nouveauDocument();
  await d.entete(agence);
  d.ligne("COMPTE RENDU DE GESTION", { taille: 20, gras: true, couleur: VERT });
  d.espace(6);
  d.ligne(`Propriétaire : ${b.proprietaire.nomComplet}`, { gras: true });
  d.ligne(`Période : ${periode(b.mois)}${b.mandat ? `   -   Mandat ${b.mandat.numero}` : ""}`);
  d.espace(8);

  if (b.lignes.length === 0) {
    d.paragraphe("Aucun loyer n'est attendu pour ce mois sur les biens de ce propriétaire.");
  } else {
    d.tableau(
      ["Bien", "Locataire", "Loyer dû", "Encaissé", "Reste"],
      b.lignes.map((l) => [l.designation, l.locataire ?? "", f(l.montantDu), f(l.encaisse), f(l.reste)]),
      [175, 130, 65, 65, 60],
      [2, 3, 4],
      ["Total", "", f(b.attendu), f(b.encaisse), f(b.impayes)],
    );
  }

  d.espace(4);
  d.ligne("Décompte (FCFA)", { gras: true, couleur: VERT });
  d.espace(4);
  const lignes: string[][] = [
    ["Loyers encaissés", f(b.encaisse)],
    ...(b.parMandat.length > 1
      ? b.parMandat.map((m) => [`Commission${m.libelle ? ` - ${m.libelle}` : ` - mandat ${m.numero}`} (${String(m.commissionPct).replace(".", ",")} %)`, `- ${f(m.commission)}`])
      : [[`Commission de l'agence (${String(b.commissionPct).replace(".", ",")} %)`, `- ${f(b.commission)}`]]),
    ...b.retenues.map((r) => [`Retenue : ${r.libelle}`, `- ${f(r.montant)}`]),
    ...b.avances.filter((a) => a.prelevement > 0).map((a) => [`Remboursement d'avance${a.motif ? ` (${a.motif})` : ""} - reste ${f(a.resteApres)}`, `- ${f(a.prelevement)}`]),
  ];
  d.tableau(["Libellé", "Montant"], lignes, [395, 100], [1], ["Net à reverser au propriétaire", f(b.net)]);

  if (b.impayes > 0) {
    d.paragraphe(`Loyers restant dus pour la période : ${f(b.impayes)} FCFA. Ils ne génèrent aucune commission tant qu'ils ne sont pas encaissés.`);
  }
  if (b.reversement) {
    d.paragraphe(
      `Reversé le ${dateFr(b.reversement.reverseLe)}${b.reversement.reference ? ` (référence ${b.reversement.reference})` : ""} : ${f(b.reversement.montant)} FCFA.`,
    );
  } else if (b.mandat && b.net > 0) {
    d.paragraphe(`À reverser au plus tard le ${b.mandat.jourReversement} du mois suivant.`);
  }
  d.espace(10);
  d.ligne(`Établi le ${dateFr(new Date())}.`, { taille: 9, couleur: GRIS });
  d.piedDePage("Document généré par Nuuf.");
  return d.sauver();
}
