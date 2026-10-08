import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { assurerEcheances, courtMois, debutMois, encaissementsParMois, libelleMois, loyersDuMois } from "@/lib/loyers";
import { getUser } from "@/lib/session";

const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: "Espèces", VIREMENT: "Virement" } as const;

async function Contenu() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const forfait = user.membres[0].organisation.abonnement?.forfait;
  const now = new Date();
  const mois = debutMois(now);
  await assurerEcheances(orgId, mois);

  const [m, serie, nbBiens, nbBaux, derniers] = await Promise.all([
    loyersDuMois(orgId, mois, now),
    encaissementsParMois(orgId, mois, 6),
    db.bien.count({ where: { organisationId: orgId, archiveLe: null } }),
    db.bail.count({ where: { actif: true, bien: { organisationId: orgId, archiveLe: null } } }),
    db.paiement.findMany({
      where: { statut: "CONFIRME", echeance: { bail: { bien: { organisationId: orgId } } } },
      orderBy: { creeLe: "desc" },
      take: 5,
      include: { quittance: true, echeance: { include: { bail: { include: { locataire: true, bien: true } } } } },
    }),
  ]);

  const taux = m.attendu ? Math.round((m.encaisse / m.attendu) * 100) : 0;
  const occupation = nbBiens ? Math.round((nbBaux / nbBiens) * 100) : 0;
  const maxSerie = Math.max(1, ...serie.map((s) => s.total));
  const cumul = serie.reduce((s, x) => s + x.total, 0);
  const retards = m.lignes.filter((l) => l.etat === "EN_RETARD").sort((a, b) => b.jours - a.jours);
  const totalCanaux = Object.values(m.canaux).reduce((s, v) => s + v, 0);
  const prenom = user.nomComplet.split(" ")[0];
  const sansBien = nbBiens === 0;

  return (
    <>
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-xl">
        <div>
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Bonjour {prenom} 👋</h1>
            {forfait && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-primary">
                {forfait === "PRO" ? "Bailleur Pro" : forfait === "AGENCE" ? "Agence" : forfait === "DECOUVERTE" ? "Essai" : "Bailleur"}
              </span>
            )}
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Voici la situation consolidée de vos loyers pour <span className="font-semibold text-on-surface">{libelleMois(mois)}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Link href="/paiements" className="flex items-center gap-2 px-space-md h-11 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-all shadow-sm font-label-lg text-label-lg">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span>Saisir espèces</span>
          </Link>
          <Link href="/biens/nouveau" className="flex items-center gap-2 px-space-md h-11 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md font-label-lg text-label-lg">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Ajouter un bien</span>
          </Link>
        </div>
      </section>

      {sansBien && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Démarrage rapide</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Ajoutez votre premier bien et son locataire pour commencer à suivre vos loyers.</p>
          </div>
          <Link href="/bienvenue" className="inline-flex items-center justify-center gap-2 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            Démarrer la configuration
          </Link>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Loyers encaissés</span>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(m.encaisse)}</span>
                <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
              </div>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[26px]">savings</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="text-primary font-bold">{m.nbRecus}</span>/{m.lignes.length} loyers reçus
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-surface-container-high text-primary">{taux}% collecté</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Loyers en retard</span>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                <span className="font-display-currency-mobile text-display-currency-mobile text-error">{fcfa(m.montantRetard)}</span>
                <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
              </div>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-xl bg-error-container flex items-center justify-center text-on-error-container shadow-inner">
              <span className="material-symbols-outlined text-[26px]">schedule</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">{m.nbRetards} locataire{m.nbRetards > 1 ? "s" : ""} en souffrance</span>
            {m.nbRetards > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-error-container text-on-error-container">Action requise</span>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Reste à percevoir</span>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                <span className="font-display-currency-mobile text-display-currency-mobile text-secondary">{fcfa(m.montantAttente)}</span>
                <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
              </div>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-inner">
              <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Échéances à venir</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-secondary-fixed text-on-secondary-fixed">{m.nbAttente} en attente</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Taux d&apos;occupation</span>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{occupation}</span>
                <span className="font-headline-md text-headline-md font-bold text-primary">%</span>
              </div>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[26px]">domain</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">{nbBaux} {nbBaux > 1 ? "loués" : "loué"} sur {nbBiens} bien{nbBiens > 1 ? "s" : ""}</span>
            {nbBiens - nbBaux > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-surface-container-high text-on-surface-variant">{nbBiens - nbBaux} vacance{nbBiens - nbBaux > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-2">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Encaissements des 6 derniers mois</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Cumul {fcfa(cumul)} FCFA</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Wave / OM
                </div>
                <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span> Espèces
                </div>
              </div>
            </div>
            <div className="relative h-48 flex items-end justify-between px-2 sm:px-6 pt-6">
              {serie.map((s, i) => {
                const courant = i === serie.length - 1;
                const hauteur = (v: number) => Math.round((v / maxSerie) * 144);
                return (
                  <div key={s.mois.toISOString()} className="flex flex-col items-center gap-2 w-11 sm:w-14">
                    <span className={`font-label-md text-label-md ${courant ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                      {s.total ? `${(s.total / 1_000_000).toFixed(2)}M` : ""}
                    </span>
                    <div className="w-full bg-surface-container-high rounded-t-lg flex flex-col justify-end overflow-hidden" style={{ height: 144 }}>
                      <div className="w-full bg-secondary-container" style={{ height: hauteur(s.especes) }}></div>
                      <div className="w-full bg-primary" style={{ height: hauteur(s.numerique) }}></div>
                    </div>
                    <span className={`font-label-md text-label-md ${courant ? "text-primary font-extrabold" : "text-on-surface-variant"}`}>{courtMois(s.mois)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 bg-surface-container-low p-space-md rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md font-bold text-on-surface">Canaux d&apos;encaissement de {libelleMois(mois).split(" ")[0]}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{totalCanaux ? "Tout est tracé" : "Aucun encaissement ce mois"}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container flex overflow-hidden mb-3">
              {totalCanaux > 0 && (
                <>
                  <div className="h-full bg-[#1EA5FC]" style={{ width: `${(m.canaux.WAVE / totalCanaux) * 100}%` }}></div>
                  <div className="h-full bg-[#FF7900]" style={{ width: `${(m.canaux.ORANGE_MONEY / totalCanaux) * 100}%` }}></div>
                  <div className="h-full bg-primary-container" style={{ width: `${((m.canaux.ESPECES + m.canaux.VIREMENT) / totalCanaux) * 100}%` }}></div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                ["Wave", "#1EA5FC", m.canaux.WAVE],
                ["Orange Money", "#FF7900", m.canaux.ORANGE_MONEY],
                ["Espèces", "var(--color-primary-container)", m.canaux.ESPECES + m.canaux.VIREMENT],
              ].map(([nom, couleur, v]) => (
                <div key={String(nom)} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: String(couleur) }}></span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      {String(nom)}
                      {totalCanaux ? ` (${Math.round((Number(v) / totalCanaux) * 100)}%)` : ""}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{fcfa(Number(v))} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-error to-secondary-container"></div>
          <div className="flex items-center justify-between pb-space-sm mb-space-sm">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Retards de loyer</h2>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">{retards.length}</span>
            </div>
            <Link className="font-label-md text-label-md text-primary font-semibold hover:underline" href="/paiements">Voir tout</Link>
          </div>
          {retards.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">Aucun retard ce mois. 🎉</p>
          ) : (
            <div className="flex flex-col gap-3">
              {retards.slice(0, 4).map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-surface-container-low">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-label-lg text-label-lg font-bold text-on-surface">{l.bail.locataire.nomComplet}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{l.bail.bien.designation}</p>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-error">{fcfa(l.reste)} FCFA</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-on-error-container">
                      {l.jours} jour{l.jours > 1 ? "s" : ""} de retard
                    </span>
                    <a
                      href={`https://wa.me/${l.bail.locataire.telephone.replace(/\D/g, "")}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d3f3e2] text-[#0b3d2e] hover:bg-[#bfe9d3] transition-colors font-label-md text-label-md font-semibold shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>Relancer</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm mb-space-xl">
        <div className="flex items-center justify-between pb-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Derniers encaissements</h2>
          <Link className="font-label-md text-label-md text-primary font-semibold hover:underline" href="/quittances">Voir les quittances</Link>
        </div>
        {derniers.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Aucun encaissement pour le moment.</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {derniers.map((p) => {
              const loc = p.echeance.bail.locataire;
              return (
                <div key={p.id} className="flex items-center justify-between py-3 gap-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(loc.nomComplet)}</div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{loc.nomComplet}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {p.echeance.bail.bien.designation} • {CANAL[p.canal]} • {telAffiche(loc.telephone)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-lg text-label-lg text-primary font-bold">{fcfa(p.montant)} FCFA</span>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{p.quittance?.numero}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu />
    </Suspense>
  );
}
