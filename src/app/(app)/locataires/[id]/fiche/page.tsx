import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import SignatureTactile from "@/components/SignatureTactile";
import { ajouterDocuments, enregistrerFiche, supprimerDocument } from "@/app/actions/locataires";
import { MAX_DOCUMENTS } from "@/lib/documents";
import { db } from "@/lib/db";
import { JUSTIFICATIFS, SITUATIONS, STATUTS_PRO } from "@/lib/fiche";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Fiche de renseignement")) };
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

async function Contenu({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { t } = await getT();
  const { id } = await params;
  const { erreur, ok } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const loc = await db.locataire.findFirst({ where: { id, organisationId: membre.organisationId }, include: { baux: { where: { actif: true }, take: 1, include: { bien: true } }, documents: { orderBy: { creeLe: "asc" } } } });
  if (!loc) notFound();
  if (membre.role === "LECTURE_SEULE") redirect(`/locataires/${id}`);
  const bien = loc.baux[0]?.bien;
  const naissance = loc.dateNaissance ? loc.dateNaissance.toISOString().slice(0, 10) : "";

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-3xl">
      <div>
        <Link href={`/locataires/${loc.id}`} className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {loc.nomComplet}
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Fiche de renseignement")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {bien ? t("Locataire de {bien}. Posez les questions au locataire et saisissez ses réponses directement ici.", { bien: bien.designation }) : t("Posez les questions au locataire et saisissez ses réponses directement ici.")}
        </p>
      </div>

      {erreur && (
        <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">
          {erreur}
        </p>
      )}

      {ok && (
        <p role="status" className="rounded-xl bg-success-container text-on-success-container px-3 py-2 font-body-md text-body-md">
          {ok}
        </p>
      )}

      <Bloc titre={t("Documents du locataire")} icone="upload_file">
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
          {t("Photographiez ou téléversez la pièce d'identité et les justificatifs (JPEG, PNG, WebP ou PDF, 6 Mo maximum). Ajoutez les documents avant de remplir la fiche : le formulaire ci-dessous se recharge après chaque envoi.")}
        </p>
        {loc.documents.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            {loc.documents.map((d) => {
              const lib = JUSTIFICATIFS.find((j) => j.code === d.categorie);
              return (
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-2">
                  <a href={`/locataires/${loc.id}/documents/${d.id}`} target="_blank" className="shrink-0 w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                    {d.type === "application/pdf" ? (
                      <span className="material-symbols-outlined text-[28px] text-error">picture_as_pdf</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/locataires/${loc.id}/documents/${d.id}`} alt="" className="w-full h-full object-cover" />
                    )}
                  </a>
                  <span className="min-w-0 flex-1">
                    <span className="block font-label-md text-label-md text-on-surface font-semibold truncate">{lib ? t(lib.libelle) : t("Document")}</span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{Math.max(1, Math.round(d.taille / 1024))} Ko</span>
                  </span>
                  <form action={supprimerDocument}>
                    <input type="hidden" name="id" value={loc.id} />
                    <input type="hidden" name="docId" value={d.id} />
                    <button aria-label={t("Supprimer")} title={t("Supprimer")} className="w-10 h-10 rounded-xl text-error hover:bg-error-container/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        {loc.documents.length < MAX_DOCUMENTS && (
          <form action={ajouterDocuments} className="flex flex-col sm:flex-row gap-space-sm sm:items-end">
            <input type="hidden" name="id" value={loc.id} />
            <div className="sm:w-64">
              <label className={LABEL} htmlFor="categorie">{t("Type de document")}</label>
              <select id="categorie" name="categorie" defaultValue="CNI" className={CHAMP}>
                {JUSTIFICATIFS.map((j) => (
                  <option key={j.code} value={j.code}>{t(j.libelle)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className={LABEL} htmlFor="fichiers">{t("Fichier")}</label>
              <input id="fichiers" name="fichiers" type="file" multiple required accept="image/jpeg,image/png,image/webp,application/pdf" className={`${CHAMP} pt-2 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-on-primary file:px-3 file:py-1 file:font-label-md`} />
            </div>
            <BoutonEnvoi enCours={t("Envoi…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">upload</span>
              {t("Ajouter")}
            </BoutonEnvoi>
          </form>
        )}
      </Bloc>

      <form action={enregistrerFiche} className="flex flex-col gap-space-lg">
        <input type="hidden" name="id" value={loc.id} />

        <Bloc titre={t("Identité")} icone="badge">
          <div>
            <label className={LABEL} htmlFor="nomComplet">{t("Prénom et nom")}</label>
            <input id="nomComplet" name="nomComplet" required defaultValue={loc.nomComplet} className={CHAMP} autoComplete="off" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className={LABEL} htmlFor="dateNaissance">{t("Date de naissance")}</label>
              <input id="dateNaissance" name="dateNaissance" type="date" defaultValue={naissance} className={CHAMP} />
            </div>
            <div>
              <label className={LABEL} htmlFor="lieuNaissance">{t("Lieu de naissance")}</label>
              <input id="lieuNaissance" name="lieuNaissance" defaultValue={loc.lieuNaissance ?? ""} className={CHAMP} autoComplete="off" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className={LABEL} htmlFor="cni">{t("N° de pièce d'identité (CNI / passeport)")}</label>
              <input id="cni" name="cni" defaultValue={loc.cni ?? ""} className={CHAMP} autoComplete="off" />
            </div>
            <div>
              <label className={LABEL} htmlFor="profession">{t("Profession exercée")}</label>
              <input id="profession" name="profession" defaultValue={loc.profession ?? ""} className={CHAMP} autoComplete="off" />
            </div>
          </div>
        </Bloc>

        <Bloc titre={t("Contact")} icone="contact_phone">
          <div>
            <label className={LABEL} htmlFor="dernierDomicile">{t("Lieu du dernier domicile")}</label>
            <input id="dernierDomicile" name="dernierDomicile" defaultValue={loc.dernierDomicile ?? ""} className={CHAMP} autoComplete="off" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className={LABEL} htmlFor="contactUrgenceNom">{t("Personne à contacter en cas d'urgence")}</label>
              <input id="contactUrgenceNom" name="contactUrgenceNom" defaultValue={loc.contactUrgenceNom ?? ""} className={CHAMP} autoComplete="off" />
            </div>
            <div>
              <label className={LABEL} htmlFor="contactUrgenceTel">{t("Son numéro de téléphone")}</label>
              <input id="contactUrgenceTel" name="contactUrgenceTel" type="tel" inputMode="tel" defaultValue={loc.contactUrgenceTel ? loc.contactUrgenceTel.replace("+221", "") : ""} placeholder="77 000 00 00" className={CHAMP} autoComplete="off" />
            </div>
          </div>
        </Bloc>

        <Bloc titre={t("Famille")} icone="family_restroom">
          <fieldset>
            <legend className={LABEL}>{t("Situation de famille")}</legend>
            <div className="flex flex-wrap gap-2">
              {SITUATIONS.map((s) => (
                <label key={s.code} className="cursor-pointer">
                  <input type="radio" name="situationFamiliale" value={s.code} defaultChecked={loc.situationFamiliale === s.code} className="peer sr-only" />
                  <span className="inline-flex h-11 items-center px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary">{t(s.libelle)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-space-md">
            <div>
              <label className={LABEL} htmlFor="enfantsMineurs">{t("Enfants mineurs")}</label>
              <input id="enfantsMineurs" name="enfantsMineurs" inputMode="numeric" defaultValue={loc.enfantsMineurs ?? ""} className={CHAMP} placeholder="0" />
            </div>
            <div>
              <label className={LABEL} htmlFor="enfantsMajeurs">{t("Enfants majeurs")}</label>
              <input id="enfantsMajeurs" name="enfantsMajeurs" inputMode="numeric" defaultValue={loc.enfantsMajeurs ?? ""} className={CHAMP} placeholder="0" />
            </div>
          </div>
        </Bloc>

        <Bloc titre={t("Travail")} icone="work">
          <fieldset>
            <legend className={LABEL}>{t("Statut professionnel")}</legend>
            <div className="flex flex-wrap gap-2">
              {STATUTS_PRO.map((s) => (
                <label key={s.code} className="cursor-pointer">
                  <input type="radio" name="statutPro" value={s.code} defaultChecked={loc.statutPro === s.code} className="peer sr-only" />
                  <span className="inline-flex h-11 items-center px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary">{t(s.libelle)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className={LABEL} htmlFor="lieuTravail">{t("Lieu de travail")}</label>
            <input id="lieuTravail" name="lieuTravail" defaultValue={loc.lieuTravail ?? ""} className={CHAMP} autoComplete="off" />
          </div>
        </Bloc>

        <Bloc titre={t("Justificatifs fournis")} icone="fact_check">
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">{t("Cochez ce que le locataire a remis. Une copie de pièce d'identité en cours de validité est demandée pour chaque locataire.")}</p>
          <div className="flex flex-col gap-2">
            {JUSTIFICATIFS.map((j) => (
              <label key={j.code} className="flex items-start gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
                <input type="checkbox" name="justificatifs" value={j.code} defaultChecked={loc.justificatifs.includes(j.code)} className="mt-0.5 w-5 h-5 accent-primary" />
                <span className="font-body-md text-body-md text-on-surface">{t(j.libelle)}</span>
              </label>
            ))}
          </div>
        </Bloc>

        <Bloc titre={t("Consentement et signature")} icone="draw">
          <label className="flex items-start gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
            <input type="checkbox" name="consentement" defaultChecked={!!loc.consentementHistoriqueLe} className="mt-0.5 w-5 h-5 accent-primary" />
            <span className="font-body-md text-body-md text-on-surface">
              {t("Le locataire a été informé que l'historique de ses paiements (ponctualité, durée de location) est enregistré dans Nuuf et peut être consulté par les agences et bailleurs auxquels il présente sa candidature. Il peut demander l'accès, la rectification ou l'effacement de ces données.")}
            </span>
          </label>
          <div>
            <p className={LABEL}>{t("Signature du locataire")}</p>
            <SignatureTactile existante={loc.signature} />
          </div>
        </Bloc>

        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <Link href={`/locataires/${loc.id}`} className="h-12 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center">
            {t("Annuler")}
          </Link>
          <BoutonEnvoi enCours={t("Enregistrement…")} className="h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md">
            <span className="material-symbols-outlined text-[20px]">save</span>
            {t("Enregistrer la fiche")}
          </BoutonEnvoi>
        </div>
      </form>
    </div>
  );
}

export default function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu params={params} searchParams={searchParams} />
    </Suspense>
  );
}
