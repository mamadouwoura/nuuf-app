import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import ChampsProprietaire from "@/components/ChampsProprietaire";
import FormulaireMandat from "@/components/FormulaireMandat";
import { affecterBiens, creerAvance, detacherBien, majProprietaire, rattacherBiens, rembourserAvance, supprimerAvance, terminerMandat } from "@/app/actions/proprietaires";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { formaterDate } from "@/lib/i18n/format";
import { cleMois, debutMois } from "@/lib/loyers";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Propriétaire")) };
}

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const LABEL = "block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs";

function Bloc({ titre, icone, children }: { titre: string; icone: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface font-bold">
        <span className="material-symbols-outlined text-primary text-[22px]">{icone}</span>
        {titre}
      </h2>
      {children}
    </section>
  );
}

async function Contenu({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { t, tn, locale } = await getT();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const orgId = membre.organisationId;
  const peutEcrire = membre.role !== "LECTURE_SEULE";
  const p = await db.proprietaire.findFirst({
    where: { id, organisationId: orgId },
    include: {
      biens: { where: { archiveLe: null }, orderBy: { designation: "asc" } },
      mandats: { where: { actif: true }, orderBy: { creeLe: "asc" } },
      avances: { include: { remboursements: true }, orderBy: { accordeLe: "desc" } },
    },
  });
  if (!p) notFound();
  const libres = await db.bien.findMany({ where: { organisationId: orgId, archiveLe: null, proprietaireId: null }, orderBy: { designation: "asc" }, select: { id: true, designation: true, quartier: true } });
  const mandats = p.mandats;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const moisCourant = cleMois(debutMois(new Date()));

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-3xl">
      <div>
        <Link href="/proprietaires" className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("Propriétaires")}
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{p.nomComplet}</h1>
      </div>

      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{ok}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}

      <Bloc titre={t("Compte rendu mensuel")} icone="summarize">
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Loyers encaissés, commission, retenues et net à reverser, bien par bien.")}</p>
        <Link href={`/proprietaires/${p.id}/bilan?mois=${moisCourant}`} className="self-start inline-flex items-center gap-1.5 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
          <span className="material-symbols-outlined text-[20px]">summarize</span>
          {t("Voir le bilan du mois")}
        </Link>
      </Bloc>

      <Bloc titre={t("Coordonnées")} icone="badge">
        <form action={majProprietaire} className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <input type="hidden" name="id" value={p.id} />
          <ChampsProprietaire v={p} desactive={!peutEcrire} />
          {peutEcrire && (
            <div className="sm:col-span-2">
              <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {t("Enregistrer")}
              </BoutonEnvoi>
            </div>
          )}
        </form>
      </Bloc>

      <Bloc titre={t("Biens gérés")} icone="apartment">
        {p.biens.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun bien rattaché à ce propriétaire.")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {p.biens.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                <Link href={`/biens/${b.id}`} className="min-w-0 font-label-lg text-label-lg text-on-surface font-semibold truncate hover:text-primary">
                  {b.designation} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">· {b.quartier}</span>
                </Link>
                {peutEcrire && (
                  <form action={detacherBien}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="bienId" value={b.id} />
                    <button className="h-9 px-3 rounded-lg text-error font-label-md text-label-md font-semibold hover:bg-error-container/40">{t("Détacher")}</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {peutEcrire && libres.length > 0 && (
          <form action={rattacherBiens} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={p.id} />
            <p className={LABEL}>{t("Rattacher des biens de votre parc")}</p>
            {libres.map((b) => (
              <label key={b.id} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2 cursor-pointer">
                <input type="checkbox" name="biens" value={b.id} className="w-5 h-5 accent-primary" />
                <span className="font-body-md text-body-md text-on-surface">{b.designation} <span className="text-on-surface-variant">· {b.quartier}</span></span>
              </label>
            ))}
            <BoutonEnvoi enCours={t("Enregistrement…")} className="self-start h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
              {t("Rattacher")}
            </BoutonEnvoi>
          </form>
        )}
        {libres.length === 0 && p.biens.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Ajoutez d'abord des biens dans « Biens ».")}</p>}
      </Bloc>

      <Bloc titre={t("Mandats de gestion")} icone="contract">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t("Un mandat par portefeuille, chacun avec son taux de commission. Les biens sans portefeuille précis suivent le premier mandat.")}
        </p>
        {mandats.length === 0 && (
          <span className="self-start px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{t("Mandat à établir")}</span>
        )}
        {mandats.map((m, i) => {
          const principal = i === 0;
          const siens = p.biens.filter((x) => x.mandatId === m.id || (principal && !x.mandatId));
          return (
            <div key={m.id} className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-success-container text-on-success-container font-label-md text-label-md font-bold">
                  {m.numero} · {String(m.commissionPct).replace(".", ",")} %
                </span>
                {m.libelle && <span className="font-label-lg text-label-lg text-on-surface font-semibold">{m.libelle}</span>}
                {principal && mandats.length > 1 && <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">{t("Principal")}</span>}
                <a href={`/proprietaires/${p.id}/mandat?m=${m.id}`} target="_blank" className="ml-auto inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  {t("Mandat PDF")}
                </a>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {m.signatureAgence && m.signatureProprietaire ? t("Signé par les deux parties") : t("Signature incomplète")} ·{" "}
                {tn(siens.length, "Couvre {n} bien.", "Couvre {n} biens.")}
                {principal && mandats.length > 1 ? ` ${t("(biens non affectés à un autre portefeuille)")}` : ""}
              </p>
              {peutEcrire && !principal && p.biens.length > 0 && (
                <details>
                  <summary className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold cursor-pointer select-none">
                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                    {t("Biens de ce portefeuille…")}
                  </summary>
                  <form action={affecterBiens} className="mt-space-sm flex flex-col gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="mandatId" value={m.id} />
                    {p.biens.map((x) => (
                      <label key={x.id} className="flex items-center gap-3 rounded-xl bg-surface-container-lowest px-3 py-2 cursor-pointer">
                        <input type="checkbox" name="biens" value={x.id} defaultChecked={x.mandatId === m.id} className="w-5 h-5 accent-primary" />
                        <span className="font-body-md text-body-md text-on-surface">{x.designation} <span className="text-on-surface-variant">· {x.quartier}</span></span>
                      </label>
                    ))}
                    <BoutonEnvoi enCours={t("Enregistrement…")} className="self-start h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold">{t("Enregistrer les biens")}</BoutonEnvoi>
                  </form>
                </details>
              )}
              {peutEcrire && (
                <details>
                  <summary className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold cursor-pointer select-none">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    {t("Modifier le mandat…")}
                  </summary>
                  <FormulaireMandat proprietaireId={p.id} mandat={m} aujourdhui={aujourdhui} />
                  <form action={terminerMandat} className="mt-space-sm">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="mandatId" value={m.id} />
                    <button className="h-10 px-4 rounded-xl text-error font-label-md text-label-md font-semibold hover:bg-error-container/40">{t("Mettre fin à ce mandat")}</button>
                  </form>
                </details>
              )}
            </div>
          );
        })}
        {peutEcrire && (
          <details open={mandats.length === 0}>
            <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold cursor-pointer select-none">
              <span className="material-symbols-outlined text-[20px]">add</span>
              {mandats.length === 0 ? t("Établir le mandat") : t("Ajouter un portefeuille")}
            </summary>
            <FormulaireMandat proprietaireId={p.id} mandat={null} aujourdhui={aujourdhui} />
          </details>
        )}
      </Bloc>

      <Bloc titre={t("Avances au propriétaire")} icone="payments">
        <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Une avance est remboursée automatiquement sur les bilans mensuels, sans jamais rendre le net négatif.")}</p>
        {p.avances.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune avance enregistrée.")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {p.avances.map((a) => {
              const rembourse = a.remboursements.reduce((n, r) => n + r.montant, 0);
              const reste = a.montant - rembourse;
              return (
                <li key={a.id} className="rounded-xl bg-surface-container-low p-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      {fcfa(a.montant)} FCFA <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">· {formaterDate(a.accordeLe, locale, { day: "2-digit", month: "short", year: "numeric" })}{a.motif ? ` · ${a.motif}` : ""}</span>
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${reste === 0 ? "bg-success-container text-on-success-container" : "bg-secondary-fixed text-on-secondary-fixed-variant"}`}>
                      {reste === 0 ? t("Soldée") : t("Reste {n} FCFA", { n: fcfa(reste) })}
                    </span>
                  </div>
                  {a.mensualite ? <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Remboursement : {n} FCFA par mois au maximum.", { n: fcfa(a.mensualite) })}</p> : null}
                  {peutEcrire && reste > 0 && (
                    <form action={rembourserAvance} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="avanceId" value={a.id} />
                      <div>
                        <label htmlFor={`remb-${a.id}`} className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("Remboursement reçu à part (FCFA)")}</label>
                        <input id={`remb-${a.id}`} name="montant" inputMode="numeric" required className={CHAMP} />
                      </div>
                      <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">{t("Enregistrer")}</BoutonEnvoi>
                    </form>
                  )}
                  {peutEcrire && rembourse === 0 && (
                    <form action={supprimerAvance}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="avanceId" value={a.id} />
                      <button className="h-9 px-3 rounded-lg text-error font-label-md text-label-md font-semibold hover:bg-error-container/40">{t("Supprimer l'avance")}</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {peutEcrire && (
          <form action={creerAvance} className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <input type="hidden" name="id" value={p.id} />
            <div>
              <label htmlFor="avance-montant" className={LABEL}>{t("Montant de l'avance (FCFA)")}</label>
              <input id="avance-montant" name="montant" inputMode="numeric" required placeholder="200 000" className={CHAMP} />
            </div>
            <div>
              <label htmlFor="avance-date" className={LABEL}>{t("Date")}</label>
              <input id="avance-date" name="accordeLe" type="date" required defaultValue={aujourdhui} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="avance-motif" className={LABEL}>{t("Motif (facultatif)")}</label>
              <input id="avance-motif" name="motif" maxLength={120} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="avance-mensualite" className={LABEL}>{t("Remboursement maximum par mois (facultatif)")}</label>
              <input id="avance-mensualite" name="mensualite" inputMode="numeric" placeholder="50 000" className={CHAMP} />
            </div>
            <div className="sm:col-span-2">
              <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">{t("Enregistrer l'avance")}</BoutonEnvoi>
            </div>
          </form>
        )}
      </Bloc>
    </div>
  );
}

export default function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu params={params} searchParams={searchParams} />
    </Suspense>
  );
}
