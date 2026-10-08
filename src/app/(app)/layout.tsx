import { Suspense } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { libelleMois } from "@/lib/loyers";
import { modeSimulation } from "@/lib/passerelle";
import { getUser } from "@/lib/session";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const forfait = user.membres[0].organisation.abonnement?.forfait ?? "DECOUVERTE";
  const libelle = forfait === "PRO" ? "Bailleur Pro" : forfait === "AGENCE" ? "Agence" : "Bailleur particulier";
  const [nbBiens, nbRetards] = await Promise.all([
    db.bien.count({ where: { organisationId: orgId, archiveLe: null } }),
    db.echeance.count({
      where: { statut: { in: ["EN_ATTENTE", "PARTIELLE"] }, dateLimite: { lt: new Date() }, bail: { bien: { organisationId: orgId } } },
    }),
  ]);
  const acces = etatAcces(user.membres[0].organisation.abonnement);
  const bandeau =
    acces.etat === "ESSAI"
      ? { ton: "info" as const, texte: `Essai gratuit : il vous reste ${acces.joursRestants} jour${(acces.joursRestants ?? 0) > 1 ? "s" : ""}. Choisissez votre forfait pour continuer sans interruption.` }
      : acces.etat === "GRACE"
        ? { ton: "alerte" as const, texte: `Votre abonnement est arrivé à échéance. Réglez-le sous ${acces.joursRestants} jour${(acces.joursRestants ?? 0) > 1 ? "s" : ""} pour éviter le passage en lecture seule.` }
        : acces.etat === "ESSAI_TERMINE" || acces.etat === "LECTURE_SEULE"
          ? { ton: "alerte" as const, texte: "Accès en lecture seule : vos données sont conservées. Activez un abonnement pour reprendre l'encaissement." }
          : null;
  return (
    <AppShell nom={user.nomComplet} libelleCompte={libelle} nbBiens={nbBiens} nbRetards={nbRetards} bandeau={bandeau} moisLabel={libelleMois(new Date())} simulation={modeSimulation()}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-body-md">Chargement…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
