import Link from "next/link";
import Pagination, { decouper, numeroPage } from "@/components/Pagination";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { encaisserEspeces } from "@/app/actions/paiements";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { assurerEcheances, cleMois, debutMois, depuisCle, libelleMois, loyersDuMois, moisPrecedent } from "@/lib/loyers";
import { getUser } from "@/lib/session";

export const metadata = { title: "Paiements" };

type Params = { mois?: string; erreur?: string; ok?: string; page?: string };

const ETAT = {
  PAYE: { classe: "bg-success-container text-on-success-container", libelle: "Payé", icone: "check_circle" },
  EN_ATTENTE: { classe: "bg-secondary-fixed text-on-secondary-fixed-variant", libelle: "En attente", icone: "hourglass_top" },
  EN_RETARD: { classe: "bg-error-container text-on-error-container", libelle: "En retard", icone: "error" },
} as const;
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { mois: cle, erreur, ok, page: pageBrut } = await searchParams;
  const page = numeroPage(pageBrut);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const now = new Date();
  const mois = depuisCle(cle, now);
  const courant = cleMois(mois) === cleMois(debutMois(now));
  if (mois <= debutMois(now)) await assurerEcheances(orgId, mois);
  const m = await loyersDuMois(orgId, mois, now);
  const taux = m.attendu ? Math.round((m.encaisse / m.attendu) * 100) : 0;
  const retour = `/paiements?mois=${cleMois(mois)}`;
  const suivant = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth() + 1, 1));
  const peutEncaisser = user.membres[0].role !== "LECTURE_SEULE";

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-space-xs">
            <Link href={`/paiements?mois=${cleMois(moisPrecedent(mois))}`} aria-label="Mois précédent" className="w-9 h-9 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </Link>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">{libelleMois(mois)}</span>
            {!courant && suivant <= debutMois(now) && (
              <Link href={`/paiements?mois=${cleMois(suivant)}`} aria-label="Mois suivant" className="w-9 h-9 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-surface-container">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </Link>
            )}
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Paiements – {libelleMois(mois)}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Suivi des encaissements et quittances.</p>
        </div>
        <a href={`/paiements/export?mois=${cleMois(mois)}`} className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container font-label-lg text-label-lg font-bold self-start lg:self-auto">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Exporter (Excel)
        </a>
      </div>

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}
      {ok && <p className="rounded-xl bg-success-container text-on-success-container px-space-md py-2 font-body-md text-body-md">Paiement enregistré. La quittance a été générée.</p>}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Total encaissé</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(m.encaisse)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{taux}% collecté • {m.nbRecus} loyer{m.nbRecus > 1 ? "s" : ""} reçu{m.nbRecus > 1 ? "s" : ""} sur {m.lignes.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Attendu théorique</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface">{fcfa(m.attendu)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{m.lignes.length} bail{m.lignes.length > 1 ? "s" : ""}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">En retard / en attente</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-error">{fcfa(m.montantRetard)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{m.nbRetards} en retard • {m.nbAttente} en attente ({fcfa(m.montantAttente)} FCFA)</p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">Loyers du mois</h2>
        {m.lignes.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Aucune échéance pour ce mois. Ajoutez un bien et son locataire pour commencer.</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {decouper(m.lignes, page).map((l) => {
              const e = ETAT[l.etat];
              const loc = l.bail.locataire;
              return (
                <div key={l.id} className="py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-3 lg:w-1/3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(loc.nomComplet)}</div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{loc.nomComplet}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{l.bail.bien.designation} • {telAffiche(loc.telephone)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md lg:w-1/3">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(l.montantDu)} FCFA</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${e.classe}`}>
                      <span className="material-symbols-outlined text-[15px]">{e.icone}</span>
                      {e.libelle}
                      {l.etat === "EN_RETARD" && ` (+${l.jours}j)`}
                    </span>
                    {l.paye > 0 && l.reste > 0 && (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{fcfa(l.paye)} reçus, reste {fcfa(l.reste)}</span>
                    )}
                  </div>
                  <div className="lg:w-1/3 flex lg:justify-end">
                    {l.reste > 0 && peutEncaisser ? (
                      <form action={encaisserEspeces} className="flex items-center gap-2">
                        <input type="hidden" name="echeanceId" value={l.id} />
                        <input type="hidden" name="retour" value={retour} />
                        <input
                          name="montant"
                          defaultValue={l.reste}
                          inputMode="numeric"
                          aria-label="Montant en espèces"
                          className="h-10 w-28 px-3 rounded-xl bg-surface text-on-surface font-label-lg text-label-lg focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                        <button className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-bold">
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          Encaisser en espèces
                        </button>
                      </form>
                    ) : (
                      l.paiements[0] && (
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {CANAL[l.paiements[0].canal]} • {l.paiements[0].quittance?.numero}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Pagination page={page} total={m.lignes.length} chemin="/paiements" params={{ mois: cleMois(mois) }} />
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
