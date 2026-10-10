import { anonymiserLocataire } from "@/app/actions/locataires";
import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fcfa, initiales, statutLoyer, libelleStatut, telAffiche } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { formaterDate, nomMois } from "@/lib/i18n/format";
import { N_ } from "@/lib/i18n/translate";
import { JUSTIFICATIFS, SITUATIONS, STATUTS_PRO, ficheComplete } from "@/lib/fiche";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Fiche locataire")) };
}

const PASTILLE = {
  PAYE: "bg-success-container text-on-success-container",
  EN_ATTENTE: "bg-secondary-fixed text-on-secondary-fixed-variant",
  PARTIEL: "bg-secondary-fixed text-on-secondary-fixed-variant",
  EN_RETARD: "bg-error-container text-on-error-container",
  VACANT: "bg-surface-container-high text-on-surface-variant",
} as const;

async function Fiche({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const { t, tn, locale } = await getT();
  const { id } = await params;
  const { fiche, erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const loc = await db.locataire.findFirst({
    where: { id, organisationId: user.membres[0].organisationId },
    include: {
      baux: {
        orderBy: { debutLe: "desc" },
        include: { bien: true, echeances: { orderBy: { mois: "desc" }, include: { paiements: { where: { statut: "CONFIRME" } } } } },
      },
      documents: { orderBy: { creeLe: "asc" } },
    },
  });
  if (!loc) notFound();
  const now = new Date();
  const bail = loc.baux.find((b) => b.actif) ?? loc.baux[0];
  const echeances = loc.baux.flatMap((b) => b.echeances);
  const verse = echeances.reduce((s, e) => s + e.paiements.reduce((x, p) => x + p.montant, 0), 0);
  const nbQuittances = echeances.reduce((s, e) => s + e.paiements.length, 0);
  const closes = echeances.filter((e) => e.dateLimite < now);
  const aTemps = closes.filter((e) => e.statut === "PAYEE").length;
  const st = statutLoyer(bail?.echeances[0], now);
  const prochaine = bail?.echeances.find((e) => e.statut !== "PAYEE");
  const complete = ficheComplete(loc);
  const peutEcrire = user.membres[0].role !== "LECTURE_SEULE";
  const situation = SITUATIONS.find((x) => x.code === loc.situationFamiliale);
  const statut = STATUTS_PRO.find((x) => x.code === loc.statutPro);
  const remis = JUSTIFICATIFS.filter((j) => loc.justificatifs.includes(j.code));
  const lignesFiche: [string, string | null][] = [
    [t("Date de naissance"), loc.dateNaissance ? formaterDate(loc.dateNaissance, locale, { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }) : null],
    [t("Lieu de naissance"), loc.lieuNaissance],
    [t("Lieu du dernier domicile"), loc.dernierDomicile],
    [t("Personne à contacter en cas d'urgence"), loc.contactUrgenceNom ? `${loc.contactUrgenceNom}${loc.contactUrgenceTel ? ` · ${telAffiche(loc.contactUrgenceTel)}` : ""}` : loc.contactUrgenceTel ? telAffiche(loc.contactUrgenceTel) : null],
    [t("Situation de famille"), situation ? t(situation.libelle) : null],
    [t("Enfants"), loc.enfantsMineurs != null || loc.enfantsMajeurs != null ? t("{a} mineur(s) · {b} majeur(s)", { a: loc.enfantsMineurs ?? 0, b: loc.enfantsMajeurs ?? 0 }) : null],
    [t("Statut professionnel"), statut ? t(statut.libelle) : null],
    [t("Lieu de travail"), loc.lieuTravail],
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <Link href="/locataires" className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("Locataires")}
        </Link>
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{loc.nomComplet}</h1>
          <span className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[st.code]}`}>
            {bail?.actif ? `${t("Locataire en place")} • ${libelleStatut(st, t)}` : t("Ancien locataire")}
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Total loyers versés")}</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(verse)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tn(nbQuittances, "{n} quittance acquittée", "{n} quittances acquittées")}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Ponctualité locative")}</span>
          <div className="mt-2 font-display-currency-mobile text-display-currency-mobile text-primary">
            {closes.length ? `${Math.round((aTemps / closes.length) * 100)}%` : "—"}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tn(closes.length, "{a}/{n} échéance réglée", "{a}/{n} échéances réglées", { a: aTemps })}</p>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{t("Prochaine échéance")}</span>
          <div className="mt-2 font-display-currency-mobile text-display-currency-mobile text-on-surface">
            {prochaine ? formaterDate(prochaine.dateLimite, locale, { day: "2-digit", month: "short" }) : "—"}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{bail ? t("{montant} FCFA / mois", { montant: fcfa(bail.loyerMensuel) }) : ""}</p>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col lg:flex-row gap-space-lg">
        <div className="flex items-center gap-space-md lg:w-1/2">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center font-bold">{initiales(loc.nomComplet)}</div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{loc.nomComplet}</h2>
            {loc.profession && <p className="font-body-md text-body-md text-on-surface-variant">{loc.profession}</p>}
            {bail && <p className="font-body-sm text-body-sm text-on-surface-variant">{bail.bien.designation}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm lg:w-1/2">
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("Téléphone mobile")}</span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold">{telAffiche(loc.telephone)}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("CNI / Passeport")}</span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold">{loc.cni ?? t("Non renseignée")}</span>
          </div>
        </div>
      </section>

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
      {fiche === "efface" && (
        <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{t("Données personnelles supprimées. Les montants et quittances sont conservés.")}</p>
      )}
      {fiche === "ok" && (
        <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">{t("Fiche de renseignement enregistrée.")}</p>
      )}

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Fiche de renseignement")}</h2>
            <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${complete ? "bg-success-container text-on-success-container" : "bg-secondary-fixed text-on-secondary-fixed-variant"}`}>
              {complete ? t("Complète") : t("À compléter")}
            </span>
          </div>
          <div className="flex flex-wrap gap-space-sm">
            {peutEcrire && (
              <Link href={`/locataires/${loc.id}/fiche`} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                {loc.ficheRemplieLe ? t("Modifier la fiche") : t("Remplir la fiche")}
              </Link>
            )}
            {bail?.actif && (
              <a href={`/biens/${bail.bienId}/contrat`} target="_blank" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px]">description</span>
                {t("Contrat PDF")}
              </a>
            )}
          </div>
        </div>
        {loc.ficheRemplieLe ? (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {lignesFiche.map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-surface-container-low">
                  <dt className="font-body-sm text-body-sm text-on-surface-variant">{k}</dt>
                  <dd className="font-label-lg text-label-lg text-on-surface font-semibold">{v ?? <span className="text-outline font-normal">{t("Non renseigné")}</span>}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              {remis.map((j) => (
                <span key={j.code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                  {t(j.libelle)}
                </span>
              ))}
              {remis.length === 0 && <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Aucun justificatif coché.")}</span>}
            </div>
            {loc.documents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {loc.documents.map((d) => {
                  const lib = JUSTIFICATIFS.find((j) => j.code === d.categorie);
                  return (
                    <a key={d.id} href={`/locataires/${loc.id}/documents/${d.id}`} target="_blank" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[18px]">{d.type === "application/pdf" ? "picture_as_pdf" : "image"}</span>
                      {lib ? t(lib.libelle) : t("Document")}
                    </a>
                  );
                })}
              </div>
            )}
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {loc.consentementHistoriqueLe ? t("Consentement à l'historique locatif recueilli le {date}.", { date: formaterDate(loc.consentementHistoriqueLe, locale, { day: "2-digit", month: "long", year: "numeric" }) }) : t("Consentement à l'historique locatif non recueilli.")}
              {loc.signeLe ? ` ${t("Signature enregistrée.")}` : ""}
            </p>
          </>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune fiche pour ce locataire. Remplissez-la avec lui : identité, famille, travail, justificatifs et signature.")}</p>
        )}
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">{t("Historique des loyers")}</h2>
        {echeances.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune échéance.")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {echeances.map((e) => {
              const s = statutLoyer(e, now);
              return (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize">
                    {nomMois(e.mois, locale)} {e.mois.getUTCFullYear()}
                  </span>
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">{fcfa(e.montantDu)} FCFA</span>
                    <span className={`px-2.5 py-1 rounded-full font-label-md text-label-md font-bold ${PASTILLE[s.code]}`}>{libelleStatut(s, t)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {peutEcrire && !loc.baux.some((b) => b.actif) && loc.nomComplet !== "Locataire supprimé" && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Supprimer les données personnelles")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("À la demande de l'ancien locataire, son nom, son téléphone, sa fiche, sa signature et ses documents sont effacés. Les montants, échéances et quittances restent, sans lien avec une personne, pour votre comptabilité.")}
          </p>
          <details>
            <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg font-semibold cursor-pointer select-none">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              {t("Supprimer les données…")}
            </summary>
            <form action={anonymiserLocataire} className="mt-space-md flex flex-col gap-space-sm">
              <input type="hidden" name="id" value={loc.id} />
              <label className="flex items-start gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
                <input type="checkbox" name="confirmer" required className="mt-0.5 w-5 h-5 accent-error" />
                <span className="font-body-md text-body-md text-on-surface">{t("Je confirme : cette suppression est définitive.")}</span>
              </label>
              <button className="self-start h-11 px-space-lg rounded-xl bg-error text-on-error font-label-lg text-label-lg font-bold">{t("Supprimer définitivement")}</button>
            </form>
          </details>
        </section>
      )}
    </div>
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Fiche params={params} searchParams={searchParams} />
    </Suspense>
  );
}
