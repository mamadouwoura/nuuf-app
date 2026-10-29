import Chargement from "@/components/Chargement";
import ModelesRelance from "@/components/ModelesRelance";
import Pagination, { decouper, numeroPage } from "@/components/Pagination";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { annulerRelanceProgrammee, programmerRelance, relancer, sauverParametresRelance } from "@/app/actions/messages";
import { db } from "@/lib/db";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { assurerEcheances, debutMois, loyersDuMois } from "@/lib/loyers";
import { HEURE_PAR_DEFAUT, JOURS_MAX, LIBELLE_SENS, MAX_REGLES, REGLES_PAR_DEFAUT, decoupeJours } from "@/lib/relances-regles";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Relances")) };
}

type Params = { ok?: string; erreur?: string; page?: string };

const carte = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg";
const champ = "h-11 rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface ring-1 ring-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container";

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t, tn, locale } = await getT();
  const { ok, erreur, page: pageBrut } = await searchParams;
  const page = numeroPage(pageBrut);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const peutModifier = user.membres[0].role !== "LECTURE_SEULE";
  const now = new Date();
  const mois = debutMois(now);
  await assurerEcheances(orgId, mois);

  const [m, reglages, reglesBase, programmees, historique] = await Promise.all([
    loyersDuMois(orgId, mois, now),
    db.parametresRelance.findUnique({ where: { organisationId: orgId } }),
    db.regleRelance.findMany({ where: { organisationId: orgId }, orderBy: { jours: "asc" } }),
    db.relanceProgrammee.findMany({
      where: { organisationId: orgId, envoyeeLe: null, annuleeLe: null },
      orderBy: { envoiLe: "asc" },
      take: 30,
      include: { echeance: { include: { bail: { include: { locataire: true, bien: true } } } } },
    }),
    db.relance.findMany({
      where: { echeance: { bail: { bien: { organisationId: orgId } } } },
      orderBy: { envoyeeLe: "desc" },
      take: 8,
      include: { echeance: { include: { bail: { include: { locataire: true } } } } },
    }),
  ]);
  // Sans réglage enregistré : les trois relances d'origine, toutes actives, à 9 h.
  const regles = reglages ? reglesBase.map((r) => ({ jours: r.jours, actif: r.actif })) : REGLES_PAR_DEFAUT.map((jours) => ({ jours, actif: true }));
  const heure = reglages?.heureEnvoi ?? HEURE_PAR_DEFAUT;
  const libelle = (jours: number) => {
    const { sens, nombre } = decoupeJours(jours);
    return t(LIBELLE_SENS[sens], { n: nombre });
  };

  const retards = m.lignes.filter((l) => l.etat === "EN_RETARD").sort((a, b) => b.jours - a.jours);
  const visibles = decouper(retards, page);
  // Dernière relance de chaque loyer affiché (indépendante de l'historique récent).
  const dernieres = await db.relance.groupBy({ by: ["echeanceId"], where: { echeanceId: { in: visibles.map((l) => l.id) } }, _max: { envoyeeLe: true } });
  const derniere = new Map<string, Date>();
  for (const d of dernieres) if (d._max.envoyeeLe) derniere.set(d.echeanceId, d._max.envoyeeLe);
  const aujourdhui = now.toISOString().slice(0, 10);
  const dateHeure = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">notifications_active</span> {t("Automatisation WhatsApp")}
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Relances")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Relancez les loyers en retard et réglez les rappels automatiques.")}</p>
      </div>

      {ok && (
        <p role="status" className="rounded-xl bg-success-container text-on-success-container px-space-md py-2 font-body-md text-body-md">
          {ok === "programmee" ? t("Relance programmée.") : ok === "annulee" ? t("Relance programmée annulée.") : t("Paramètres enregistrés.")}
        </p>
      )}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className={carte}>
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Loyers en retard")}</h2>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">{retards.length}</span>
            </div>
            {retards.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun loyer en retard. 🎉")}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {visibles.map((l) => {
                  const loc = l.bail.locataire;
                  const d = derniere.get(l.id);
                  return (
                    <div key={l.id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(loc.nomComplet)}</div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-lg text-label-lg text-on-surface font-semibold">{loc.nomComplet}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{l.bail.bien.designation} • {telAffiche(loc.telephone)}</span>
                            <span className="font-body-sm text-body-sm text-error font-semibold">{fcfa(l.reste)} FCFA • {tn(l.jours, "{n} jour de retard", "{n} jours de retard")}</span>
                            {d && <span className="text-[11px] text-on-surface-variant">{t("Dernière relance : {date}", { date: formaterDate(d, locale, { day: "2-digit", month: "short" }) })}</span>}
                          </div>
                        </div>
                        <form action={relancer}>
                          <input type="hidden" name="echeanceId" value={l.id} />
                          <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-action-soft hover:bg-action-soft-hover text-on-action-soft font-label-md text-label-md font-semibold shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">chat</span> {t("Relancer")}
                          </button>
                        </form>
                      </div>
                      {peutModifier && l.bail.actif && (
                        <details className="group rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/40">
                          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-label-md text-label-md font-semibold text-primary">
                            <span className="material-symbols-outlined text-[18px]">schedule_send</span>
                            {t("Programmer une relance")}
                            <span className="material-symbols-outlined ml-auto text-[18px] transition-transform group-open:rotate-180">expand_more</span>
                          </summary>
                          <form action={programmerRelance} className="flex flex-wrap items-end gap-2 px-3 pb-3">
                            <input type="hidden" name="echeanceId" value={l.id} />
                            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                              {t("Date")}
                              <input type="date" name="date" required min={aujourdhui} className={champ} />
                            </label>
                            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                              {t("Heure (Dakar)")}
                              <input type="time" name="heure" required defaultValue="09:00" className={champ} />
                            </label>
                            <button className="h-11 rounded-xl bg-primary-container px-4 font-label-md text-label-md font-bold text-on-primary hover:bg-primary">{t("Programmer l'envoi")}</button>
                          </form>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Pagination page={page} total={retards.length} chemin="/relances" />
          </div>

          <div className={carte} id="programmees">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">{t("Relances programmées")}</h2>
            {programmees.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune relance programmée. Utilisez « Programmer une relance » sous un loyer en retard.")}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-container">
                {programmees.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-label-lg text-label-lg font-semibold text-on-surface">{p.echeance.bail.locataire.nomComplet}</span>
                      <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">
                        {p.echeance.bail.bien.designation} • {dateHeure(p.envoiLe)}
                      </span>
                    </span>
                    {peutModifier && (
                      <form action={annulerRelanceProgrammee}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="h-9 shrink-0 rounded-full bg-surface-container px-4 font-label-md text-label-md font-semibold text-on-surface-variant hover:text-error">{t("Annuler")}</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <form action={sauverParametresRelance} className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md self-start">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Relances automatiques")}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Choisissez quand Nuuf relance un locataire. Chaque règle part une seule fois par loyer, tant qu'il n'est pas payé.")}</p>

          <fieldset disabled={!peutModifier} className="flex flex-col gap-2">
            <legend className="sr-only">{t("Règles de relance")}</legend>
            {regles.length === 0 && <p className="rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface-variant">{t("Aucune règle : aucune relance automatique ne partira.")}</p>}
            {regles.map((r) => (
              <div key={r.jours} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                <input type="hidden" name="regle" value={r.jours} />
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" name="on" value={r.jours} defaultChecked={r.actif} className="w-5 h-5 accent-primary" />
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">{libelle(r.jours)}</span>
                </label>
                <label className="group relative cursor-pointer" title={t("Retirer cette règle")}>
                  <input type="checkbox" name="suppr" value={r.jours} className="peer sr-only" />
                  <span className="material-symbols-outlined grid size-9 place-items-center rounded-full text-[20px] text-on-surface-variant transition-colors group-hover:text-error peer-checked:bg-error-container peer-checked:text-on-error-container peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container">delete</span>
                </label>
              </div>
            ))}
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-outline-variant p-3">
              <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                {t("Ajouter une règle")}
                <select name="nouveauSens" defaultValue="" className={champ}>
                  <option value="">—</option>
                  <option value="avant">{t("Avant l'échéance")}</option>
                  <option value="jour">{t("Le jour de l'échéance")}</option>
                  <option value="apres">{t("Après l'échéance")}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                {t("Nombre de jours")}
                <input type="number" name="nouveauNombre" min={0} max={JOURS_MAX} inputMode="numeric" placeholder="3" className={`${champ} w-28`} />
              </label>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">{t("Jusqu'à {n} règles, de 30 jours avant à 60 jours après l'échéance. Cochez la corbeille pour retirer une règle.", { n: MAX_REGLES })}</p>
          </fieldset>

          <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3">
            <span>
              <span className="block font-label-lg text-label-lg font-semibold text-on-surface">{t("Heure d'envoi")}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("Heure de Dakar. Les relances partent à partir de cette heure.")}</span>
            </span>
            <select name="heureEnvoi" defaultValue={String(heure)} disabled={!peutModifier} className={champ}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{h} h</option>
              ))}
            </select>
          </label>

          <h3 className="font-label-lg text-label-lg font-bold text-on-surface">{t("Textes des messages")}</h3>
          <ModelesRelance avant={reglages?.modeleAvant ?? null} retard={reglages?.modeleRetard ?? null} />

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t("L'envoi automatique démarrera dès la connexion de WhatsApp Business à votre compte. En attendant, utilisez « Relancer ».")}
          </p>
          {peutModifier && (
            <button className="h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary">
              {t("Enregistrer les paramètres")}
            </button>
          )}
        </form>
      </section>

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">{t("Historique des relances")}</h2>
        {historique.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune relance envoyée pour le moment.")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {historique.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">{h.echeance.bail.locataire.nomComplet}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {h.declencheur === "manuelle" ? t("Relance manuelle") : h.declencheur === "programmée" ? t("Relance programmée") : h.declencheur} •{" "}
                  {formaterDate(h.envoyeeLe, locale, { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
