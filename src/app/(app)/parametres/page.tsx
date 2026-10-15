import Chargement from "@/components/Chargement";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ajouterCompteEncaissement,
  ajouterMembre,
  changerMotDePasse,
  deconnecterAutresAppareils,
  changerRole,
  majIdentite,
  majProfil,
  retirerMembre,
  supprimerCompteEncaissement,
} from "@/app/actions/compte";
import { db } from "@/lib/db";
import { FORFAITS } from "@/lib/forfaits";
import { initiales, telAffiche } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Paramètres")) };
}

type Params = { ok?: string; erreur?: string };
const ROLE = { PROPRIETAIRE: N_("Propriétaire"), GESTIONNAIRE: N_("Gestionnaire"), LECTURE_SEULE: N_("Lecture seule") } as const;
const CANAL = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", ESPECES: N_("Espèces"), VIREMENT: N_("Virement") } as const;

const champ = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const bouton = "h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary";
const carte = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md";

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  const { ok, erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const org = membre.organisation;
  const proprio = membre.role === "PROPRIETAIRE";
  const forfait = FORFAITS[org.abonnement?.forfait ?? "DECOUVERTE"];
  const [aLogo, comptes, equipe] = await Promise.all([
    db.logoOrganisation.count({ where: { organisationId: org.id } }),
    db.compteEncaissement.findMany({ where: { organisationId: org.id }, orderBy: { id: "asc" } }),
    db.membre.findMany({ where: { organisationId: org.id }, include: { utilisateur: true }, orderBy: { creeLe: "asc" } }),
  ]);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Paramètres du compte")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Votre profil, vos comptes d'encaissement et votre équipe.")}</p>
      </div>
      {ok && <p className="rounded-xl bg-success-container text-on-success-container px-space-md py-2 font-body-md text-body-md">{ok}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">person</span>{t("Mon profil")}</h2>
        <form action={majProfil} className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <label className="flex flex-col gap-1">
            <span className="font-label-lg text-label-lg font-semibold">{t("Prénom et nom")}</span>
            <input name="nomComplet" defaultValue={user.nomComplet} required className={champ} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-lg text-label-lg font-semibold">{t("Téléphone (identifiant de connexion)")}</span>
            <input value={telAffiche(user.telephone)} readOnly className={`${champ} opacity-70`} />
          </label>
          {proprio && (
            <label className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg font-semibold">{t("NINEA (optionnel)")}</span>
              <input name="ninea" defaultValue={org.ninea ?? ""} className={champ} />
            </label>
          )}
          <div className="md:col-span-2"><button className={bouton}>{t("Enregistrer")}</button></div>
        </form>
      </section>

      {proprio && (
        <section className={carte}>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">badge</span>{t("Identité sur vos documents")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Votre logo et vos coordonnées figurent en tête des contrats, mandats, bilans et quittances.")}</p>
          <form action={majIdentite} className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="font-label-lg text-label-lg font-semibold">{t("Adresse")}</span>
              <input name="adresse" defaultValue={org.adresse ?? ""} maxLength={160} className={champ} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg font-semibold">{t("Téléphone de l'agence ou du bailleur")}</span>
              <input name="telephonePro" defaultValue={org.telephonePro ? telAffiche(org.telephonePro) : ""} inputMode="tel" className={champ} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg font-semibold">{t("E-mail")}</span>
              <input name="email" type="email" defaultValue={org.email ?? ""} maxLength={120} className={champ} />
            </label>
            <div className="flex flex-col gap-2 md:col-span-2">
              <span className="font-label-lg text-label-lg font-semibold">{t("Logo (PNG ou JPEG, 400 Ko maximum)")}</span>
              {aLogo > 0 && (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/parametres/logo" alt={t("Logo actuel")} className="h-14 w-auto max-w-40 object-contain rounded-lg bg-surface-container-low p-1" />
                  <label className="flex items-center gap-2 font-body-md text-body-md">
                    <input type="checkbox" name="retirerLogo" />
                    {t("Retirer le logo")}
                  </label>
                </div>
              )}
              <input name="logo" type="file" accept="image/png,image/jpeg" className="font-body-md text-body-md" />
            </div>
            <div className="md:col-span-2"><button className={bouton}>{t("Enregistrer")}</button></div>
          </form>
        </section>
      )}

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">account_balance_wallet</span>{t("Comptes d'encaissement")}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Les numéros Wave et Orange Money où vous recevez vos loyers.")}</p>
        {comptes.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucun compte enregistré.")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {comptes.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-label-lg text-label-lg font-semibold">{t(CANAL[c.canal])}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant"> • {telAffiche(c.telephone)}{c.libelle ? ` • ${c.libelle}` : ""}</span>
                </div>
                {proprio && (
                  <form action={supprimerCompteEncaissement}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="h-9 px-3 rounded-lg bg-surface-container text-error font-label-md text-label-md font-semibold hover:bg-error-container">{t("Retirer")}</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
        {proprio && (
          <form action={ajouterCompteEncaissement} className="grid grid-cols-1 md:grid-cols-4 gap-space-sm items-end">
            <select name="canal" aria-label={t("Opérateur")} className={champ}><option value="WAVE">Wave</option><option value="ORANGE_MONEY">Orange Money</option></select>
            <input name="telephone" placeholder="77 123 45 67" required className={champ} />
            <input name="libelle" placeholder={t("Libellé (optionnel)")} className={champ} />
            <button className={bouton}>{t("Ajouter")}</button>
          </form>
        )}
      </section>

      <section className={carte}>
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">group</span>{t("Équipe et rôles")}</h2>
          <span className="font-label-md text-label-md text-on-surface-variant">{t("{a} / {b} accès", { a: equipe.length, b: forfait.acces })}</span>
        </div>
        <div className="flex flex-col divide-y divide-surface-container">
          {equipe.map((m) => (
            <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(m.utilisateur.nomComplet)}</div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-semibold">{m.utilisateur.nomComplet}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{telAffiche(m.utilisateur.telephone)}</span>
                </div>
              </div>
              {m.role === "PROPRIETAIRE" || !proprio ? (
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold self-start">{t(ROLE[m.role])}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <form action={changerRole} className="flex items-center gap-2">
                    <input type="hidden" name="membreId" value={m.id} />
                    <select name="role" aria-label={t("Rôle du membre")} defaultValue={m.role} className="h-10 px-3 rounded-xl bg-surface-container-low font-label-md text-label-md">
                      <option value="GESTIONNAIRE">{t("Gestionnaire")}</option>
                      <option value="LECTURE_SEULE">{t("Lecture seule")}</option>
                    </select>
                    <button className="h-10 px-3 rounded-xl bg-surface hover:bg-surface-container text-primary font-label-md text-label-md font-semibold">{t("Appliquer")}</button>
                  </form>
                  <form action={retirerMembre}>
                    <input type="hidden" name="membreId" value={m.id} />
                    <button className="h-10 px-3 rounded-xl bg-surface-container text-error font-label-md text-label-md font-semibold hover:bg-error-container">{t("Retirer")}</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
        {proprio && forfait.acces > 1 && equipe.length < forfait.acces && (
          <form action={ajouterMembre} className="grid grid-cols-1 md:grid-cols-5 gap-space-sm items-end pt-space-sm">
            <input name="nomComplet" placeholder={t("Nom (ex. Awa, assistante)")} required className={champ} />
            <input name="telephone" placeholder="77 123 45 67" required className={champ} />
            <select name="role" aria-label={t("Rôle du nouveau membre")} className={champ}><option value="GESTIONNAIRE">{t("Gestionnaire")}</option><option value="LECTURE_SEULE">{t("Lecture seule")}</option></select>
            <input name="motDePasse" type="password" placeholder={t("Mot de passe provisoire")} minLength={8} required className={champ} />
            <button className={bouton}>{t("Ajouter")}</button>
          </form>
        )}
        {proprio && forfait.acces === 1 && (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("Votre forfait inclut un seul accès.")} <Link href="/abonnement/forfait" className="text-primary font-semibold underline">{t("Passez au forfait Pro")}</Link> {t("pour inviter votre équipe (jusqu'à 5 accès).")}
          </p>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t("Gestionnaire : biens, locataires, paiements, relances, quittances. Lecture seule : consultation uniquement. L'abonnement et les comptes d'encaissement restent réservés au propriétaire.")}
        </p>
      </section>

      <section className={carte}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">security</span>{t("Sécurité")}</h2>
        <form action={changerMotDePasse} className="grid grid-cols-1 md:grid-cols-3 gap-space-sm items-end">
          <input name="ancien" type="password" placeholder={t("Mot de passe actuel")} required className={champ} />
          <input name="nouveau" type="password" placeholder={t("Nouveau mot de passe (8 caractères min.)")} minLength={8} required className={champ} />
          <button className={bouton}>{t("Modifier")}</button>
        </form>
        <form action={deconnecterAutresAppareils} className="flex flex-wrap items-center gap-space-sm">
          <button className="h-11 px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container-high">{t("Déconnecter mes autres appareils")}</button>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Utile si vous avez perdu un téléphone ou utilisé un ordinateur partagé.")}</span>
        </form>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Chaque connexion est confirmée par un code à 6 chiffres envoyé sur votre téléphone.")}</p>
      </section>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
