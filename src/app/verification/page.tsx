import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDevOtp, getPendingUid } from "@/lib/session";
import Screen, { bodyClass } from "@/ports/VerificationNumero";

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const uid = await getPendingUid();
  if (!uid) redirect("/connexion");
  const user = await db.utilisateur.findUnique({ where: { id: uid } });
  const devCode = await getDevOtp();
  const tel = user?.telephone ?? "";
  const affiche = tel.replace(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/, "+221 $1 $2 $3 $4");
  return <Screen erreur={erreur} devCode={devCode} telephone={affiche} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <div className={bodyClass}>
      <Suspense fallback={null}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
