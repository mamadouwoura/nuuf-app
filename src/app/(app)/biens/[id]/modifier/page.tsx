import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { archiverBien, modifierBien } from "@/app/actions/biens";
import { ajouterPhotos, supprimerPhoto } from "@/app/actions/photos";
import { MAX_PHOTOS } from "@/lib/photos";
import { db } from "@/lib/db";
import { TYPE_LIBELLE } from "@/lib/immo";
import { getUser } from "@/lib/session";

export const metadata = { title: "Modifier le bien" };

const CHAMP =
  "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all";

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-lg text-label-lg text-on-surface font-semibold">{label}</span>
      {children}
    </label>
  );
}

async function Contenu({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const [{ id }, { erreur, ok }] = await Promise.all([params, searchParams]);
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (membre.role === "LECTURE_SEULE") redirect(`/biens/${id}`);
  const bien = await db.bien.findFirst({
    where: { id, organisationId: membre.organisationId, archiveLe: null },
    include: { baux: { where: { actif: true }, include: { locataire: true }, take: 1 }, photos: { orderBy: { creeLe: "asc" } } },
  });
  if (!bien) notFound();
  const bail = bien.baux[0];

  return (
    <div className="flex flex-col w-full max-w-3xl gap-space-lg">
      <div>
        <Link href={`/biens/${id}`} className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Retour à la fiche
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Modifier le bien</h1>
      </div>

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}

      {ok && <p className="rounded-xl bg-emerald-50 text-emerald-800 px-space-md py-2 font-body-md text-body-md">{ok}</p>}

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Photos ({bien.photos.length}/{MAX_PHOTOS})</h2>
        {bien.photos.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
            {bien.photos.map((p) => (
              <li key={p.id} className="relative rounded-xl overflow-hidden bg-surface-container aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/biens/${id}/photos/${p.id}`} alt={`Photo de ${bien.designation}`} className="w-full h-full object-cover" />
                <form action={supprimerPhoto} className="absolute top-1.5 right-1.5">
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="photoId" value={p.id} />
                  <button aria-label="Supprimer cette photo" title="Supprimer" className="w-8 h-8 rounded-full bg-surface-container-lowest/90 text-error flex items-center justify-center shadow-sm hover:bg-error-container">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {bien.photos.length < MAX_PHOTOS && (
          <form action={ajouterPhotos} className="flex flex-wrap items-center gap-space-sm">
            <input type="hidden" name="id" value={id} />
            <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required aria-label="Choisir des photos" className="font-body-md text-body-md text-on-surface-variant file:mr-3 file:h-11 file:px-space-md file:rounded-xl file:border-0 file:bg-surface-container file:text-on-surface file:font-label-lg file:font-semibold file:cursor-pointer" />
            <button className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors">Ajouter</button>
          </form>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">JPEG, PNG ou WebP, 5 Mo maximum par photo.</p>
      </section>

      <form action={modifierBien} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <input type="hidden" name="id" value={id} />
        <Champ label="Désignation">
          <input name="designation" required defaultValue={bien.designation} className={CHAMP} />
        </Champ>
        <Champ label="Type de bien">
          <select name="type" defaultValue={bien.type} className={CHAMP}>
            {Object.entries(TYPE_LIBELLE).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Champ>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <Champ label="Quartier"><input name="quartier" required defaultValue={bien.quartier} className={CHAMP} /></Champ>
          <Champ label="Ville"><input name="ville" required defaultValue={bien.ville} className={CHAMP} /></Champ>
          <Champ label="Adresse (facultatif)"><input name="adresse" defaultValue={bien.adresse ?? ""} className={CHAMP} /></Champ>
          <Champ label="Surface en m² (facultatif)"><input name="surfaceM2" inputMode="numeric" defaultValue={bien.surfaceM2 ?? ""} className={CHAMP} /></Champ>
        </div>

        {bail && (
          <>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold pt-space-sm">Bail et locataire</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <Champ label="Loyer mensuel (FCFA)"><input name="loyer" required inputMode="numeric" defaultValue={bail.loyerMensuel} className={CHAMP} /></Champ>
              <Champ label="Jour d'échéance (1 à 28)"><input name="jour" required inputMode="numeric" defaultValue={bail.jourEcheance} className={CHAMP} /></Champ>
              <Champ label="Nom du locataire"><input name="locNom" required defaultValue={bail.locataire.nomComplet} className={CHAMP} /></Champ>
              <Champ label="Téléphone du locataire"><input name="locTel" required defaultValue={bail.locataire.telephone} className={CHAMP} /></Champ>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Un nouveau loyer ou un nouveau jour d&apos;échéance s&apos;applique aux échéances à venir non réglées ; l&apos;historique reste inchangé.
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-space-sm pt-space-sm">
          <button className="h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors">
            Enregistrer
          </button>
          <Link href={`/biens/${id}`} className="h-12 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold inline-flex items-center hover:bg-surface-container-high transition-colors">
            Annuler
          </Link>
        </div>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Archiver ce bien</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Le bien disparaît de la liste et libère un logement de votre forfait. Le bail prend fin, les loyers à venir non réglés sont retirés ; l&apos;historique et les quittances sont conservés.
        </p>
        <details className="group">
          <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg font-semibold cursor-pointer select-none list-none">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Archiver…
          </summary>
          <form action={archiverBien} className="mt-space-sm flex flex-wrap items-center gap-space-sm">
            <input type="hidden" name="id" value={id} />
            <span className="font-body-md text-body-md text-on-surface">Confirmer l&apos;archivage de « {bien.designation} » ?</span>
            <button className="h-11 px-space-md rounded-xl bg-error text-on-error font-label-lg text-label-lg font-bold">Oui, archiver</button>
          </form>
        </details>
      </section>
    </div>
  );
}

export default function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu {...props} />
    </Suspense>
  );
}
