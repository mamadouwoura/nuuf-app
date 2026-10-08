import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { resilier } from "@/app/actions/abonnement";
import { db } from "@/lib/db";
import { etatAcces, JOURS_GRACE } from "@/lib/abonnement";
import { FORFAITS, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getUser } from "@/lib/session";

type Params = { ok?: string };
const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const ETAT = {
  ESSAI: ["Essai gratuit", "bg-secondary-fixed text-on-secondary-fixed"],
  ACTIF: ["Actif", "bg-emerald-50 text-emerald-800"],
  GRACE: ["Paiement en retard", "bg-secondary-fixed text-on-secondary-fixed"],
  ESSAI_TERMINE: ["Essai terminé", "bg-error-container text-on-error-container"],
  LECTURE_SEULE: ["Lecture seule", "bg-error-container text-on-error-container"],
} as const;

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { ok } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const abo = membre.organisation.abonnement!;
  const acces = etatAcces(abo);
  const [nb, equipe, factures] = await Promise.all([
    db.bien.count({ where: { organisationId: membre.organisationId, archiveLe: null } }),
    db.membre.count({ where: { organisationId: membre.organisationId } }),
    db.factureAbonnement.findMany({ where: { abonnementId: abo.id, payeeLe: { not: null } }, orderBy: { payeeLe: "desc" }, take: 10 }),
  ]);
  const f = FORFAITS[abo.forfait];
  const limite = f.logements;
  const pct = Number.isFinite(limite) ? Math.min(100, Math.round((nb / limite) * 100)) : 0;
  const [libEtat, classeEtat] = ETAT[acces.etat];
  const proprietaire = membre.role === "PROPRIETAIRE";

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Abonnement et facturation</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Votre forfait, vos quotas et vos factures.</p>
        </div>
        <Link href="/abonnement/forfait" className="flex items-center gap-2 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary hover:bg-primary shadow-md font-label-lg text-label-lg font-bold self-start">
          <span className="material-symbols-outlined text-[20px]">upgrade</span>
          {abo.statut === "ESSAI" ? "Choisir un forfait" : "Changer de forfait"}
        </Link>
      </div>

      {ok === "paye" && <p className="rounded-xl bg-emerald-50 text-emerald-800 px-space-md py-2 font-body-md text-body-md">Paiement reçu : votre abonnement est actif.</p>}
      {ok === "resilie" && <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-space-md py-2 font-body-md text-body-md">Abonnement résilié. Vous gardez l&apos;accès jusqu&apos;à la fin de la période payée.</p>}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Forfait {f.nom}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${classeEtat}`}>{libEtat}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(prixMensuel(abo.forfait, nb))}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA / mois {abo.annuel ? "• facturation annuelle" : ""}</span>
          </div>
          {acces.finLe && (
            <p className="font-body-md text-body-md text-on-surface-variant">
              {acces.etat === "ESSAI" || acces.etat === "ESSAI_TERMINE"
                ? `Essai jusqu'au ${dateFr(acces.finLe)}.`
                : acces.etat === "GRACE"
                  ? `Renouvellement en retard : accès maintenu jusqu'au ${dateFr(acces.finLe)} (${JOURS_GRACE} jours de grâce), puis lecture seule.`
                  : abo.statut === "RESILIE"
                    ? `Résilié : accès jusqu'au ${dateFr(acces.finLe)}.`
                    : `Prochain renouvellement : ${dateFr(acces.finLe)}. Un lien de paiement vous sera envoyé par WhatsApp.`}
            </p>
          )}
          <div>
            <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
              <span>Logements utilisés</span>
              <span>{nb} / {Number.isFinite(limite) ? limite : "illimité"}</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div className={`h-full ${pct >= 100 ? "bg-error" : "bg-primary"}`} style={{ width: `${pct}%` }}></div>
            </div>
          </div>
          <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
            <span>Accès équipe</span>
            <span>{equipe} / {f.acces}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Moyens de règlement</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Le renouvellement se règle par lien de paiement Wave ou Orange Money. Il n&apos;y a pas de prélèvement automatique.
          </p>
          {proprietaire && abo.statut !== "RESILIE" && abo.statut !== "ESSAI" && (
            <form action={resilier} className="mt-auto">
              <button className="w-full h-11 rounded-xl bg-surface-container text-error font-label-lg text-label-lg font-semibold hover:bg-error-container">Résilier l&apos;abonnement</button>
            </form>
          )}
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">Factures</h2>
        {factures.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Aucune facture pour le moment.</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {factures.map((x) => (
              <div key={x.id} className="py-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Forfait {FORFAITS[x.forfait].nom} • {x.annuel ? "annuel" : "mensuel"}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {dateFr(x.payeeLe!)} • {x.nbLogements} logement{x.nbLogements > 1 ? "s" : ""} • réf. {x.referenceOperateur}
                  </span>
                </div>
                <span className="font-label-lg text-label-lg text-primary font-bold">{fcfa(x.montant)} FCFA</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
