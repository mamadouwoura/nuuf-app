import { Suspense } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { numerosAdmin } from "@/lib/admin";
import { libelleMois } from "@/lib/loyers";
import { modeSimulation } from "@/lib/passerelle";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

async function Shell({ children }: { children: React.ReactNode }) {
  const { t, tn, locale } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const forfait = user.membres[0].organisation.abonnement?.forfait ?? "DECOUVERTE";
  const libelle = forfait === "PRO" ? t("Bailleur Pro") : forfait === "AGENCE" ? t("Agence") : t("Bailleur particulier");
  const [nbBiens, nbRetards] = await Promise.all([
    db.bien.count({ where: { organisationId: orgId, archiveLe: null } }),
    db.echeance.count({
      where: { statut: { in: ["EN_ATTENTE", "PARTIELLE"] }, dateLimite: { lt: new Date() }, bail: { bien: { organisationId: orgId } } },
    }),
  ]);
  const acces = etatAcces(user.membres[0].organisation.abonnement);
  const bandeau =
    acces.etat === "ESSAI"
      ? { ton: "info" as const, texte: tn(acces.joursRestants ?? 0, "Essai gratuit : il vous reste {n} jour. Choisissez votre forfait pour continuer sans interruption.", "Essai gratuit : il vous reste {n} jours. Choisissez votre forfait pour continuer sans interruption.") }
      : acces.etat === "GRACE"
        ? { ton: "alerte" as const, texte: tn(acces.joursRestants ?? 0, "Votre abonnement est arrivé à échéance. Réglez-le sous {n} jour pour éviter le passage en lecture seule.", "Votre abonnement est arrivé à échéance. Réglez-le sous {n} jours pour éviter le passage en lecture seule.") }
        : acces.etat === "ESSAI_TERMINE" || acces.etat === "LECTURE_SEULE"
          ? { ton: "alerte" as const, texte: t("Accès en lecture seule : vos données sont conservées. Activez un abonnement pour reprendre l'encaissement.") }
          : null;
  return (
    <AppShell nom={user.nomComplet} libelleCompte={libelle} nbBiens={nbBiens} nbRetards={nbRetards} bandeau={bandeau} moisLabel={libelleMois(new Date(), locale)} simulation={modeSimulation()} admin={numerosAdmin().includes(user.telephone)}>
      {children}
    </AppShell>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="p-6 text-body-md">{t("Chargement…")}</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
