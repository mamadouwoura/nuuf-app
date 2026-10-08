"use server";

import { redirect } from "next/navigation";
import type { Forfait } from "@prisma/client";
import { db } from "@/lib/db";
import { FORFAITS, prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { finApresPaiement } from "@/lib/abonnement";
import { initierTransaction } from "@/lib/passerelle";
import { getUser } from "@/lib/session";

const CHOIX: Forfait[] = ["BAILLEUR", "PRO", "AGENCE"];

/** Souscription ou changement de forfait : crée la facture puis envoie vers le paiement. */
export async function souscrire(form: FormData) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const retour = (m: string): never => redirect(`/abonnement/forfait?erreur=${encodeURIComponent(m)}`);
  if (membre.role !== "PROPRIETAIRE") retour("Seul le propriétaire du compte peut gérer l'abonnement.");

  const forfait = String(form.get("forfait") ?? "") as Forfait;
  const annuel = form.get("periodicite") === "annuel";
  const canal = form.get("canal") === "ORANGE_MONEY" ? "ORANGE_MONEY" : "WAVE";
  if (!CHOIX.includes(forfait)) retour("Choisissez un forfait.");

  const orgId = membre.organisationId;
  const nbLogements = await db.bien.count({ where: { organisationId: orgId, archiveLe: null } });
  if (nbLogements > FORFAITS[forfait].logements) {
    retour(`Ce forfait est limité à ${FORFAITS[forfait].logements} logements : vous en gérez ${nbLogements}.`);
  }
  const equipe = await db.membre.count({ where: { organisationId: orgId } });
  if (equipe > FORFAITS[forfait].acces) {
    retour(`Ce forfait est limité à ${FORFAITS[forfait].acces} accès : votre équipe en compte ${equipe}. Retirez des membres dans Paramètres.`);
  }
  const abonnement = await db.abonnement.findUniqueOrThrow({ where: { organisationId: orgId } });
  const montant = annuel ? prixAnnuel(forfait, nbLogements) : prixMensuel(forfait, nbLogements);

  const t = await initierTransaction({ canal, montant, telephone: user.telephone });
  const debut = new Date();
  await db.factureAbonnement.create({
    data: {
      abonnementId: abonnement.id,
      forfait,
      annuel,
      montant,
      nbLogements,
      periodeDebut: debut,
      periodeFin: finApresPaiement(abonnement, { forfait, annuel, nbLogements }, debut),
      referenceOperateur: t.reference,
    },
  });
  redirect(t.urlSuite);
}

/** Résiliation : l'accès reste actif jusqu'à la fin de la période payée. */
export async function resilier() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role !== "PROPRIETAIRE") redirect("/parametres/abonnement");
  await db.abonnement.update({ where: { organisationId: membre.organisationId }, data: { statut: "RESILIE" } });
  redirect("/parametres/abonnement?ok=resilie");
}
