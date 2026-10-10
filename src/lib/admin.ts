import { notFound } from "next/navigation";
import type { Forfait } from "@prisma/client";
import { db } from "./db";
import { etatAcces } from "./abonnement";
import { FORFAITS, prixAnnuel, prixMensuel } from "./forfaits";
import { getUser } from "./session";

/** Administrateurs Nuuf : numéros listés dans ADMIN_PHONES (séparés par des virgules). */
export const numerosAdmin = () => (process.env.ADMIN_PHONES ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export const estAdmin = (telephone: string) => numerosAdmin().includes(telephone);

/** Garde du back-office : toute autre personne reçoit un 404 (le back-office n'est pas révélé). */
export async function exigerAdmin() {
  const user = await getUser();
  if (!user || !estAdmin(user.telephone)) notFound();
  return user;
}

export type LigneBailleur = Awaited<ReturnType<typeof listerBailleurs>>[number];
export type FiltreBailleur = "tous" | "payant" | "essai" | "expire";

/** Toutes les organisations avec propriétaire, abonnement, nombre de logements et état d'accès. */
export async function listerBailleurs() {
  await exigerAdmin(); // défense en profondeur : ne jamais compter sur le layout seul
  const [orgs, parOrg] = await Promise.all([
    db.organisation.findMany({
      orderBy: { creeLe: "desc" },
      include: {
        abonnement: true,
        membres: { where: { role: "PROPRIETAIRE" }, include: { utilisateur: true }, take: 1 },
      },
    }),
    db.bien.groupBy({ by: ["organisationId"], where: { archiveLe: null }, _count: { _all: true } }),
  ]);
  const nb = new Map(parOrg.map((p) => [p.organisationId, p._count._all]));
  const now = new Date();
  return orgs.map((o) => {
    const logements = nb.get(o.id) ?? 0;
    const acces = etatAcces(o.abonnement, now);
    const payant = o.abonnement?.statut === "ACTIF" || o.abonnement?.statut === "RESILIE" ? acces.ecriture : false;
    const forfait: Forfait = o.abonnement?.forfait ?? "DECOUVERTE";
    const mrr = payant
      ? o.abonnement?.annuel
        ? Math.round(prixAnnuel(forfait, logements) / 12)
        : prixMensuel(forfait, logements)
      : 0;
    const categorie: FiltreBailleur = payant ? "payant" : acces.etat === "ESSAI" ? "essai" : "expire";
    return { ...o, proprio: o.membres[0]?.utilisateur ?? null, logements, acces, forfait, mrr, categorie };
  });
}

export async function statsGlobales() {
  await exigerAdmin();
  const lignes = await listerBailleurs();
  const il_y_a_30j = new Date(Date.now() - 30 * 86_400_000);
  const debut30 = il_y_a_30j;
  const [paiements, echecs] = await Promise.all([
    db.paiement.findMany({ where: { statut: "CONFIRME", creeLe: { gte: debut30 } }, select: { montant: true, canal: true } }),
    db.paiement.count({ where: { statut: "ECHEC", creeLe: { gte: debut30 } } }),
  ]);
  const volume = paiements.reduce((s, p) => s + p.montant, 0);
  const parCanal: Record<string, number> = {};
  for (const p of paiements) parCanal[p.canal] = (parCanal[p.canal] ?? 0) + p.montant;

  const payants = lignes.filter((l) => l.categorie === "payant");
  const parForfait: Record<string, number> = { BAILLEUR: 0, PRO: 0, AGENCE: 0 };
  for (const l of payants) parForfait[l.forfait] = (parForfait[l.forfait] ?? 0) + 1;

  return {
    inscrits: lignes.length,
    nouveaux30j: lignes.filter((l) => l.creeLe >= il_y_a_30j).length,
    payants: payants.length,
    essais: lignes.filter((l) => l.categorie === "essai").length,
    expires: lignes.filter((l) => l.categorie === "expire").length,
    mrr: payants.reduce((s, l) => s + l.mrr, 0),
    conversion: lignes.length ? Math.round((payants.length / lignes.length) * 100) : 0,
    parForfait,
    volume,
    parCanal,
    nbPaiements: paiements.length,
    echecs,
    logementsTotal: lignes.reduce((s, l) => s + l.logements, 0),
    quotaMoyen: payants.length ? Math.round(payants.reduce((s, l) => s + (Number.isFinite(FORFAITS[l.forfait].logements) ? l.logements / FORFAITS[l.forfait].logements : 0), 0) / payants.length * 100) : 0,
  };
}
