import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import SignatureTactile from "@/components/SignatureTactile";
import { detacherBien, enregistrerMandat, majProprietaire, rattacherBiens } from "@/app/actions/proprietaires";
import { db } from "@/lib/db";
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
  const { t, tn } = await getT();
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
      mandats: { where: { actif: true }, orderBy: { creeLe: "desc" }, take: 1 },
    },
  });
  if (!p) notFound();
  const libres = await db.bien.findMany({ where: { organisationId: orgId, archiveLe: null, proprietaireId: null }, orderBy: { designation: "asc" }, select: { id: true, designation: true, quartier: true } });
  const mandat = p.mandats[0];
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
          <div className="sm:col-span-2">
            <label htmlFor="nomComplet" className={LABEL}>{t("Prénom et nom")}</label>
            <input id="nomComplet" name="nomComplet" required defaultValue={p.nomComplet} className={CHAMP} disabled={!peutEcrire} />
          </div>
          <div>
            <label htmlFor="telephone" className={LABEL}>{t("Téléphone mobile & WhatsApp")}</label>
            <input id="telephone" name="telephone" type="tel" inputMode="tel" defaultValue={p.telephone ? p.telephone.replace("+221", "") : ""} placeholder="77 000 00 00" className={CHAMP} disabled={!peutEcrire} />
          </div>
          <div>
            <label htmlFor="cni" className={LABEL}>{t("N° de pièce d'identité (CNI / passeport)")}</label>
            <input id="cni" name="cni" defaultValue={p.cni ?? ""} className={CHAMP} disabled={!peutEcrire} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="adresse" className={LABEL}>{t("Adresse")}</label>
            <input id="adresse" name="adresse" defaultValue={p.adresse ?? ""} className={CHAMP} disabled={!peutEcrire} />
          </div>
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

      <Bloc titre={t("Mandat de gestion")} icone="contract">
        <div className="flex flex-wrap items-center gap-2">
          {mandat ? (
            <>
              <span className="px-2.5 py-1 rounded-full bg-success-container text-on-success-container font-label-md text-label-md font-bold">
                {mandat.numero} · {String(mandat.commissionPct).replace(".", ",")} %
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {mandat.signatureAgence && mandat.signatureProprietaire ? t("Signé par les deux parties") : t("Signature incomplète")}
              </span>
              <a href={`/proprietaires/${p.id}/mandat`} target="_blank" className="ml-auto inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px]">description</span>
                {t("Mandat PDF")}
              </a>
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{t("Mandat à établir")}</span>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{tn(p.biens.length, "Le mandat couvre {n} bien.", "Le mandat couvre {n} biens.")}</p>
        {peutEcrire && (
          <form action={enregistrerMandat} className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <input type="hidden" name="id" value={p.id} />
            <div>
              <label htmlFor="commissionPct" className={LABEL}>{t("Commission (% des loyers encaissés)")}</label>
              <input id="commissionPct" name="commissionPct" inputMode="decimal" required defaultValue={mandat ? String(mandat.commissionPct).replace(".", ",") : "10"} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="debutLe" className={LABEL}>{t("Début du mandat")}</label>
              <input id="debutLe" name="debutLe" type="date" required defaultValue={mandat ? mandat.debutLe.toISOString().slice(0, 10) : aujourdhui} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="dureeMois" className={LABEL}>{t("Durée (mois)")}</label>
              <input id="dureeMois" name="dureeMois" inputMode="numeric" defaultValue={mandat?.dureeMois ?? 12} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="jourReversement" className={LABEL}>{t("Reversement avant le (jour du mois)")}</label>
              <input id="jourReversement" name="jourReversement" inputMode="numeric" defaultValue={mandat?.jourReversement ?? 10} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="plafondTravaux" className={LABEL}>{t("Travaux sans accord préalable (FCFA)")}</label>
              <input id="plafondTravaux" name="plafondTravaux" inputMode="numeric" defaultValue={mandat?.plafondTravaux ?? ""} placeholder="50 000" className={CHAMP} />
            </div>
            <div>
              <label htmlFor="preavisMois" className={LABEL}>{t("Préavis de résiliation (mois)")}</label>
              <input id="preavisMois" name="preavisMois" inputMode="numeric" defaultValue={mandat?.preavisMois ?? 1} className={CHAMP} />
            </div>
            <label className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
              <input type="checkbox" name="reconduction" defaultChecked={mandat?.reconduction ?? true} className="w-5 h-5 accent-primary" />
              <span className="font-body-md text-body-md text-on-surface">{t("Renouvellement par tacite reconduction")}</span>
            </label>
            <div>
              <p className={LABEL}>{t("Signature de l'agence")}</p>
              <SignatureTactile nom="signatureAgence" existante={mandat?.signatureAgence ?? null} />
            </div>
            <div>
              <p className={LABEL}>{t("Signature du propriétaire")}</p>
              <SignatureTactile nom="signatureProprietaire" existante={mandat?.signatureProprietaire ?? null} />
            </div>
            <div className="sm:col-span-2">
              <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {mandat ? t("Mettre à jour le mandat") : t("Établir le mandat")}
              </BoutonEnvoi>
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
