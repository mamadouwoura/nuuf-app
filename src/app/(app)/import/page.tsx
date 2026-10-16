import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { analyserImport, confirmerImport } from "@/app/actions/import";
import { analyserFichier, apercuRecent } from "@/lib/import-analyse";
import type { TypeImport } from "@/lib/import";
import { peutAcceder } from "@/lib/modules";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Importer des données")) };
}

type Params = { ok?: string; erreur?: string; apercu?: string };
const CARTE = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md";
const PASTILLE = {
  ok: "bg-success-container text-on-success-container",
  existe: "bg-surface-container-high text-on-surface-variant",
  erreur: "bg-error-container text-on-error-container",
} as const;
const MAX_AFFICHEES = 100;

async function FormulaireFichier({ type }: { type: TypeImport }) {
  const { t } = await getT();
  return (
    <form action={analyserImport} encType="multipart/form-data" className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
      <input type="hidden" name="type" value={type} />
      <input
        name="fichier"
        type="file"
        accept=".csv,text/csv,text/plain"
        required
        aria-label={t("Fichier CSV")}
        className="font-body-md text-body-md text-on-surface file:mr-3 file:h-10 file:px-4 file:rounded-xl file:border-0 file:bg-surface-container file:text-primary file:font-label-md file:font-semibold"
      />
      <BoutonEnvoi enCours={t("Analyse du fichier…")} className="h-10 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
        {t("Vérifier le fichier")}
      </BoutonEnvoi>
    </form>
  );
}

/** Aperçu ligne par ligne d'un fichier envoyé, avec le bouton de confirmation. */
async function Apercu({ id, userId, orgId, forfait }: { id: string; userId: string; orgId: string; forfait: Parameters<typeof analyserFichier>[3] }) {
  const { t, tn } = await getT();
  const enregistre = await apercuRecent(id, userId, orgId);
  if (!enregistre) return <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{t("Cet aperçu a expiré : envoyez de nouveau le fichier.")}</p>;
  const type: TypeImport = enregistre.type === "biens" ? "biens" : "proprietaires";
  const r = await analyserFichier(type, enregistre.csv, orgId, forfait);
  if (!r.ok) return <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{t(r.erreur, r.vars)}</p>;
  const lignes = r.analyse.lignes;
  const nbOk = lignes.filter((l) => l.statut === "ok").length;
  const nbExistants = lignes.filter((l) => l.statut === "existe").length;
  const nbErreurs = lignes.filter((l) => l.statut === "erreur").length;

  return (
    <section className={CARTE}>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{type === "biens" ? t("Aperçu : biens et locataires") : t("Aperçu : propriétaires")}</h2>
      <p className="font-body-md text-body-md text-on-surface">
        <b>{tn(nbOk, "{n} ligne prête à importer", "{n} lignes prêtes à importer")}</b>
        {nbExistants > 0 && <> · {tn(nbExistants, "{n} déjà présente (ignorée)", "{n} déjà présentes (ignorées)")}</>}
        {nbErreurs > 0 && <> · <span className="text-error font-semibold">{tn(nbErreurs, "{n} ligne en erreur", "{n} lignes en erreur")}</span></>}
      </p>
      <ul className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-1">
        {lignes.slice(0, MAX_AFFICHEES).map((l) => (
          <li key={l.numero} className="rounded-xl bg-surface-container-low px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-body-md text-body-md text-on-surface">
                <span className="text-on-surface-variant">{t("Ligne {n}", { n: l.numero })} · </span>
                {l.resume || "—"}
              </span>
              <span className={`shrink-0 px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${PASTILLE[l.statut]}`}>
                {l.statut === "ok" ? t("Prête") : l.statut === "existe" ? t("Déjà présente") : t("Erreur")}
              </span>
            </div>
            {l.erreurs.map((e, i) => (
              <span key={i} className="font-body-sm text-body-sm text-error">{t(e.cle, e.vars)}</span>
            ))}
          </li>
        ))}
      </ul>
      {lignes.length > MAX_AFFICHEES && <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Seules les {n} premières lignes sont affichées ; toutes seront importées.", { n: MAX_AFFICHEES })}</p>}
      {nbErreurs > 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Corrigez le fichier, puis vérifiez-le à nouveau : rien n'est importé tant qu'une ligne est en erreur.")}</p>
      ) : nbOk === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Rien de nouveau à importer.")}</p>
      ) : (
        <form action={confirmerImport}>
          <input type="hidden" name="apercu" value={enregistre.id} />
          <BoutonEnvoi enCours={t("Import en cours…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
            {tn(nbOk, "Importer {n} ligne", "Importer {n} lignes")}
          </BoutonEnvoi>
        </form>
      )}
      <Link href="/import" className="self-start font-label-md text-label-md text-primary font-semibold underline">{t("Envoyer un autre fichier")}</Link>
    </section>
  );
}

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  const { ok, erreur, apercu } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const ecriture = membre.role !== "LECTURE_SEULE";
  const owners = ecriture && peutAcceder(membre, "GERANCE");
  const biens = ecriture && peutAcceder(membre, "PATRIMOINE");

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-3xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Importer des données")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("Reprenez votre fichier Excel : enregistrez-le au format CSV, vérifiez l'aperçu, puis confirmez. Rien n'est écrit avant votre confirmation.")}
        </p>
      </div>
      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{ok}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}

      {apercu && (owners || biens) && <Apercu id={apercu} userId={user.id} orgId={membre.organisationId} forfait={membre.organisation.abonnement} />}

      {!owners && !biens && <p className="font-body-md text-body-md text-on-surface-variant">{t("Votre accès ne permet pas d'importer des données.")}</p>}

      {owners && (
        <section className={CARTE}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">badge</span>{t("1. Propriétaires")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Nom, téléphone, e-mail, adresse, société, pièce… Ceux qui existent déjà sont ignorés.")}</p>
          <Link href="/import/modele/proprietaires" prefetch={false} className="self-start inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-[18px]">download</span>
            {t("Télécharger le modèle")}
          </Link>
          <FormulaireFichier type="proprietaires" />
        </section>
      )}

      {biens && (
        <section className={CARTE}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">apartment</span>{t("2. Biens et locataires")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("Un bien par ligne, avec son locataire et son loyer s'il est loué. Le propriétaire doit déjà exister : importez-les d'abord.")}
          </p>
          <Link href="/import/modele/biens" prefetch={false} className="self-start inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-[18px]">download</span>
            {t("Télécharger le modèle")}
          </Link>
          <FormulaireFichier type="biens" />
        </section>
      )}
    </div>
  );
}

export default function Page(props: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
