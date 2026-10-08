import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, initiales, statutLoyer, telAffiche } from "@/lib/immo";
import { getUser } from "@/lib/session";

type Params = { q?: string };

const PASTILLE = {
  PAYE: "bg-emerald-50 text-emerald-800",
  EN_ATTENTE: "bg-secondary-fixed text-on-secondary-fixed-variant",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  EN_RETARD: "bg-error-container text-on-error-container",
  VACANT: "bg-surface-container-high text-on-surface-variant",
} as const;

async function Liste({ searchParams }: { searchParams: Promise<Params> }) {
  const { q } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const now = new Date();
  const tous = await db.locataire.findMany({
    where: { organisationId: user.membres[0].organisationId },
    include: {
      baux: {
        where: { actif: true },
        take: 1,
        include: { bien: true, echeances: { orderBy: { mois: "desc" }, take: 1 } },
      },
    },
    orderBy: { creeLe: "desc" },
  });
  const liste = tous.filter((l) => !q || `${l.nomComplet} ${l.telephone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Mes locataires</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {tous.length} locataire{tous.length > 1 ? "s" : ""} • Suivi des loyers et des échéances
          </p>
        </div>
        <Link href="/biens/nouveau" className="flex items-center gap-2 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary hover:bg-primary shadow-md font-label-lg text-label-lg font-bold">
          <span className="material-symbols-outlined text-[22px]">person_add</span>
          <span>Nouveau locataire</span>
        </Link>
      </div>

      <form className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex gap-space-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>
        <button className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary">Rechercher</button>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        {liste.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-space-lg">
            <span className="material-symbols-outlined text-[40px] text-primary">group</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {tous.length === 0 ? "Aucun locataire pour le moment. Ils sont créés avec leur bien." : "Aucun résultat."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {liste.map((l) => {
              const bail = l.baux[0];
              const st = statutLoyer(bail?.echeances[0], now);
              return (
                <Link key={l.id} href={`/locataires/${l.id}`} className="py-space-md flex items-center justify-between gap-space-md hover:bg-surface-container-low rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(l.nomComplet)}</div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{l.nomComplet}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {bail ? bail.bien.designation : "Sans bail actif"} • {telAffiche(l.telephone)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md">
                    {bail && <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(bail.loyerMensuel)} FCFA</span>}
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[st.code]}`}>{st.libelle}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Liste searchParams={searchParams} />
    </Suspense>
  );
}
