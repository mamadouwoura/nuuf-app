import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDevOtp, getPendingInscription, getPendingUid } from "@/lib/session";
import Screen, { bodyClass } from "@/ports/VerificationNumero";
import { N_ } from "@/lib/i18n/translate";
import { getT } from "@/lib/i18n/server";
import Preferences from "@/components/Preferences";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Vérification du numéro")) };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const uid = await getPendingUid();
  const inscriptionId = uid ? null : await getPendingInscription();
  if (!uid && !inscriptionId) redirect("/connexion");
  const user = uid ? await db.utilisateur.findUnique({ where: { id: uid } }) : null;
  const attente = inscriptionId ? await db.inscriptionEnAttente.findUnique({ where: { id: inscriptionId } }) : null;
  const devCode = await getDevOtp();
  const tel = user?.telephone ?? attente?.telephone ?? "";
  const affiche = tel.replace(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/, "+221 $1 $2 $3 $4");
  return <Screen erreur={erreur} devCode={devCode} telephone={affiche} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <div className={bodyClass}>
      <Preferences flottant />
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
