import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { ajouterRetenue, annulerReversement, marquerReverse, partagerBilan, supprimerRetenue } from "@/app/actions/proprietaires";
import { calculerBilan } from "@/lib/bilan";
import { fcfa } from "@/lib/immo";
import { cleMois, debutMois, depuisCle, libelleMois, moisPrecedent } from "@/lib/loyers";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { formaterDate } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Bilan mensuel")) };
}

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";

const PASTILLE = {
  PAYE: "bg-success-container text-on-success-container",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  IMPAYE: "bg-error-container text-on-error-container",
} as const;

async function Contenu({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mois?: string; erreur?: string; ok?: string }> }) {
  const { t, locale } = await getT();
  const { id } = await params;
  const { mois: cle, erreur, ok } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const peutEcrire = membre.role !== "LECTURE_SEULE";
  const maintenant = new Date();
  const mois = depuisCle(cle, moisPrecedent(maintenant, 0));
  const b = await calculerBilan(membre.organisationId, id, mois, maintenant);
  if (!b) notFound();
  const cleCourante = cleMois(mois);
  const precedent = cleMois(moisPrecedent(mois, 1));
  const suivant = cleMois(moisPrecedent(mois, -1));
  const futur = mois >= debutMois(maintenant);

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-3xl">
      <div>
        <Link href={`/proprietaires/${b.proprietaire.id}`} className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {b.proprietaire.nomComplet}
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Bilan mensuel")}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Link href={`/proprietaires/${b.proprietaire.id}/bilan?mois=${precedent}`} aria-label={t("Mois précédent")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize min-w-36 text-center">{libelleMois(mois, locale)}</span>
          <Link href={`/proprietaires/${b.proprietaire.id}/bilan?mois=${suivant}`} aria-label={t("Mois suivant")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
      </div>

      {ok && <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{t("Reversement enregistré.")}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
      {!b.mandat && (
        <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-3 py-2 font-body-md text-body-md">
          {t("Aucun mandat : la commission est de 0 %. Établissez le mandat de ce propriétaire pour la calculer.")}{" "}
          <Link href={`/proprietaires/${b.proprietaire.id}`} className="underline font-semibold">{t("Établir le mandat")}</Link>
        </p>
      )}

      <section className="grid grid-cols-2 gap-space-sm">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Loyers attendus")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{fcfa(b.attendu)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Encaissés")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">{fcfa(b.encaisse)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Commission ({pct} %)", { pct: String(b.commissionPct).replace(".", ",") })}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{fcfa(b.commission)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="rounded-xl shadow-sm p-space-md bg-primary text-on-primary">
          <p className="font-body-sm text-body-sm opacity-80">{t("Net à reverser")}</p>
          <p className="font-headline-sm text-headline-sm font-bold">{fcfa(b.net)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Biens du mois")}</h2>
        {b.lignes.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun loyer attendu ce mois-ci pour ce propriétaire.")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {b.lignes.map((l) => (
              <li key={l.bienId + l.montantDu} className="rounded-xl bg-surface-container-low p-3 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{l.designation}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{l.locataire}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[l.etat]}`}>
                    {l.etat === "PAYE" ? t("Payé") : l.etat === "PARTIEL" ? t("Partiel") : t("Impayé")}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("Dû {du} · encaissé {enc} · reste {reste} FCFA", { du: fcfa(l.montantDu), enc: fcfa(l.encaisse), reste: fcfa(l.reste) })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Retenues du mois")}</h2>
        {b.retenues.length === 0 && <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune retenue.")}</p>}
        <ul className="flex flex-col gap-2">
          {b.retenues.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
              <span className="min-w-0 truncate font-body-md text-body-md text-on-surface">{r.libelle}</span>
              <span className="shrink-0 flex items-center gap-2">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">- {fcfa(r.montant)} FCFA</span>
                {peutEcrire && (
                  <form action={supprimerRetenue}>
                    <input type="hidden" name="id" value={b.proprietaire.id} />
                    <input type="hidden" name="mois" value={cleCourante} />
                    <input type="hidden" name="retenueId" value={r.id} />
                    <button aria-label={t("Supprimer")} className="w-9 h-9 rounded-lg text-error hover:bg-error-container/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </form>
                )}
              </span>
            </li>
          ))}
        </ul>
        {peutEcrire && !b.reversement && (
          <form action={ajouterRetenue} className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto] gap-space-sm items-end">
            <input type="hidden" name="id" value={b.proprietaire.id} />
            <input type="hidden" name="mois" value={cleCourante} />
            <div>
              <label htmlFor="libelle" className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("Motif")}</label>
              <input id="libelle" name="libelle" required placeholder={t("Réparation plomberie")} className={CHAMP} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="montant" className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("Montant (FCFA)")}</label>
              <input id="montant" name="montant" inputMode="numeric" required placeholder="25 000" className={CHAMP} autoComplete="off" />
            </div>
            <BoutonEnvoi enCours={t("Ajout…")} className="h-11 px-space-lg rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-bold">
              {t("Ajouter")}
            </BoutonEnvoi>
          </form>
        )}
      </section>

      {b.avances.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Remboursement des avances")}</h2>
          <ul className="flex flex-col gap-2">
            {b.avances.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-body-md text-body-md text-on-surface">{a.motif ?? t("Avance")} · {fcfa(a.montantInitial)} FCFA</span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("Reste {n} FCFA après ce bilan", { n: fcfa(a.resteApres) })}</span>
                </span>
                <span className="shrink-0 font-label-lg text-label-lg font-bold text-on-surface">- {fcfa(a.prelevement)} FCFA</span>
              </li>
            ))}
          </ul>
          {!b.reversement && <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Ces montants deviennent définitifs quand vous marquez le mois comme reversé.")}</p>}
        </section>
      )}

      {b.parMandat.length > 1 && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Commission par portefeuille")}</h2>
          <ul className="flex flex-col gap-2">
            {b.parMandat.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-body-md text-body-md text-on-surface">{m.libelle ?? m.numero}</span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("{pct} % sur {enc} FCFA encaissés", { pct: String(m.commissionPct).replace(".", ","), enc: fcfa(m.encaisse) })}</span>
                </span>
                <span className="shrink-0 font-label-lg text-label-lg font-bold text-on-surface">- {fcfa(m.commission)} FCFA</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {b.commissionAgent > 0 && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-1">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Part de l'agent (interne)")}</h2>
          {b.parMandat.filter((m) => m.commissionAgent > 0).map((m) => (
            <p key={m.id} className="font-body-md text-body-md text-on-surface">
              {t("{nom} : {pct} % soit {montant} FCFA", { nom: m.agentNom ?? t("Agent"), pct: String(m.commissionAgentPct).replace(".", ","), montant: fcfa(m.commissionAgent) })}
              {b.parMandat.length > 1 ? ` · ${m.libelle ?? m.numero}` : ""}
            </p>
          ))}
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Marge de l'agence après l'agent : {n} FCFA. Cette part n'apparaît pas sur le compte rendu du propriétaire.", { n: fcfa(b.margeAgence) })}</p>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Reversement")}</h2>
        {b.reversement ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-success-container text-on-success-container font-label-md text-label-md font-bold">
              {t("Reversé le {date}", { date: formaterDate(b.reversement.reverseLe, locale, { day: "2-digit", month: "long", year: "numeric" }) })}
              {b.reversement.reference ? ` · ${b.reversement.reference}` : ""}
            </span>
            {peutEcrire && (
              <form action={annulerReversement}>
                <input type="hidden" name="id" value={b.proprietaire.id} />
                <input type="hidden" name="mois" value={cleCourante} />
                <button className="h-9 px-3 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold">{t("Annuler")}</button>
              </form>
            )}
          </div>
        ) : peutEcrire ? (
          <form action={marquerReverse} className="flex flex-col sm:flex-row gap-space-sm sm:items-end">
            <input type="hidden" name="id" value={b.proprietaire.id} />
            <input type="hidden" name="mois" value={cleCourante} />
            <div className="sm:flex-1">
              <label htmlFor="reference" className="block font-label-md text-label-md text-on-surface-variant mb-1">{t("Référence du virement (facultatif)")}</label>
              <input id="reference" name="reference" className={CHAMP} autoComplete="off" />
            </div>
            <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
              {t("Marquer comme reversé")}
            </BoutonEnvoi>
          </form>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Pas encore reversé.")}</p>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Nuuf ne déplace aucun fonds : vous indiquez ici que le reversement a été fait.")}</p>
      </section>

      <div className="flex flex-wrap gap-space-sm">
        <a href={`/proprietaires/${b.proprietaire.id}/bilan/pdf?mois=${cleCourante}`} target="_blank" className="inline-flex items-center gap-1.5 h-12 px-space-lg rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-semibold">
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          {t("Bilan PDF")}
        </a>
        {peutEcrire && (
          <form action={partagerBilan}>
            <input type="hidden" name="id" value={b.proprietaire.id} />
            <input type="hidden" name="mois" value={cleCourante} />
            <button className="inline-flex items-center gap-1.5 h-12 px-space-lg rounded-xl bg-action-soft text-on-action-soft font-label-lg text-label-lg font-semibold">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {t("Envoyer sur WhatsApp")}
            </button>
          </form>
        )}
      </div>
      {futur && <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Mois en cours : les montants évoluent à chaque encaissement.")}</p>}
    </div>
  );
}

export default function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ mois?: string; erreur?: string; ok?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
