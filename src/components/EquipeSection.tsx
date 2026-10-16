import Link from "next/link";
import { cookies } from "next/headers";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import CopierLien from "@/components/CopierLien";
import { annulerInvitation, inviterMembre, modifierAcces, renouvelerInvitation } from "@/app/actions/equipe";
import { retirerMembre } from "@/app/actions/compte";
import { db } from "@/lib/db";
import { FORFAITS } from "@/lib/forfaits";
import { initiales, telAffiche } from "@/lib/immo";
import { formaterDate } from "@/lib/i18n/format";
import { COOKIE_LIEN } from "@/lib/invitations";
import { MODULES } from "@/lib/modules";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";
import type { Forfait, Role } from "@prisma/client";

const ROLE = { PROPRIETAIRE: N_("Propriétaire"), GESTIONNAIRE: N_("Gestionnaire"), LECTURE_SEULE: N_("Lecture seule") } as const;
const champ = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const bouton = "h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary";

/** Cases à cocher : ce qui est coché est autorisé. */
function ChoixModules({ refuses, idPrefixe }: { refuses: string[]; idPrefixe: string }) {
  return (
    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {MODULES.map((m) => (
        <label key={m.code} htmlFor={`${idPrefixe}-${m.code}`} className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3 py-2 cursor-pointer">
          <input id={`${idPrefixe}-${m.code}`} type="checkbox" name="modules" value={m.code} defaultChecked={!refuses.includes(m.code)} className="w-5 h-5 accent-primary" />
          <span className="material-symbols-outlined text-primary text-[20px]">{m.icone}</span>
          <span className="font-body-md text-body-md text-on-surface">{m.libelle}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default async function EquipeSection({ organisationId, proprio, forfaitCode }: { organisationId: string; proprio: boolean; forfaitCode: Forfait }) {
  const { t, locale } = await getT();
  const forfait = FORFAITS[forfaitCode];
  const maintenant = new Date();
  const [equipe, invitations, jar] = await Promise.all([
    db.membre.findMany({ where: { organisationId }, include: { utilisateur: true }, orderBy: { creeLe: "asc" } }),
    proprio ? db.invitation.findMany({ where: { organisationId, accepteeLe: null, expireLe: { gt: maintenant } }, orderBy: { creeLe: "desc" } }) : Promise.resolve([]),
    cookies(),
  ]);
  const lien = proprio ? jar.get(COOKIE_LIEN)?.value : undefined;
  const utilises = equipe.length + invitations.length;
  const date = (d: Date) => formaterDate(d, locale, { day: "2-digit", month: "short" });

  return (
    <section id="equipe" className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">group</span>{t("Équipe et accès")}</h2>
        <span className="font-label-md text-label-md text-on-surface-variant">{t("{a} / {b} accès", { a: utilises, b: forfait.acces })}</span>
      </div>

      {lien && (
        <div className="rounded-xl bg-secondary-fixed/60 p-space-md flex flex-col gap-2">
          <p className="font-label-lg text-label-lg text-on-surface font-semibold">{t("Lien d'invitation à envoyer")}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Il ne s'affiche qu'une fois et ne fonctionne qu'une fois, pendant 7 jours. La personne devra saisir son numéro pour l'ouvrir.")}</p>
          <CopierLien lien={lien} />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(t("Bonjour, voici votre invitation à rejoindre notre équipe sur Nuuf : {lien}", { lien }))}`}
            target="_blank"
            className="self-start inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-action-soft text-on-action-soft font-label-md text-label-md font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            {t("Envoyer sur WhatsApp")}
          </a>
        </div>
      )}

      <div className="flex flex-col divide-y divide-surface-container">
        {equipe.map((m) => (
          <div key={m.id} className="py-3 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(m.utilisateur.nomComplet)}</div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-semibold">{m.utilisateur.nomComplet}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {telAffiche(m.utilisateur.telephone)}
                    {m.role !== "PROPRIETAIRE" && m.modulesRefuses.length > 0 ? ` · ${t("{n} module(s) retiré(s)", { n: m.modulesRefuses.length })}` : ""}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold self-start">{t(ROLE[m.role as Role])}</span>
            </div>
            {proprio && m.role !== "PROPRIETAIRE" && (
              <details>
                <summary className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold cursor-pointer select-none">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  {t("Gérer l'accès…")}
                </summary>
                <form action={modifierAcces} className="mt-space-sm flex flex-col gap-space-sm">
                  <input type="hidden" name="membreId" value={m.id} />
                  <label className="flex flex-col gap-1">
                    <span className="font-label-md text-label-md text-on-surface-variant">{t("Rôle")}</span>
                    <select name="role" defaultValue={m.role} className={champ}>
                      <option value="GESTIONNAIRE">{t("Gestionnaire (peut modifier)")}</option>
                      <option value="LECTURE_SEULE">{t("Lecture seule (consultation)")}</option>
                    </select>
                  </label>
                  <p className="font-label-md text-label-md text-on-surface-variant">{t("Modules accessibles")}</p>
                  <ChoixModules refuses={m.modulesRefuses} idPrefixe={`m-${m.id}`} />
                  <div className="flex flex-wrap gap-2">
                    <BoutonEnvoi enCours={t("Enregistrement…")} className="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold">{t("Enregistrer l'accès")}</BoutonEnvoi>
                  </div>
                </form>
                <form action={retirerMembre} className="mt-2">
                  <input type="hidden" name="membreId" value={m.id} />
                  <button className="h-10 px-4 rounded-xl text-error font-label-md text-label-md font-semibold hover:bg-error-container/40">{t("Retirer cet accès")}</button>
                </form>
              </details>
            )}
          </div>
        ))}
      </div>

      {proprio && invitations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-label-lg text-label-lg text-on-surface font-semibold">{t("Invitations en attente")}</p>
          {invitations.map((i) => (
            <div key={i.id} className="rounded-xl bg-surface-container-low px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{i.nomComplet}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{telAffiche(i.telephone)} · {t(ROLE[i.role as Role])} · {t("expire le {date}", { date: date(i.expireLe) })}</p>
              </div>
              <div className="flex gap-2">
                <form action={renouvelerInvitation}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="h-9 px-3 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-semibold">{t("Nouveau lien")}</button>
                </form>
                <form action={annulerInvitation}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="h-9 px-3 rounded-lg text-error font-label-md text-label-md font-semibold hover:bg-error-container/40">{t("Annuler")}</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {proprio && forfait.acces > 1 && utilises < forfait.acces && (
        <details open={equipe.length === 1 && invitations.length === 0}>
          <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold cursor-pointer select-none">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            {t("Inviter un collaborateur")}
          </summary>
          <form action={inviterMembre} className="mt-space-md flex flex-col gap-space-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              <input name="nomComplet" placeholder={t("Nom (ex. Awa, assistante)")} required className={champ} aria-label={t("Nom")} />
              <input name="telephone" placeholder="77 123 45 67" required inputMode="tel" className={champ} aria-label={t("Téléphone")} />
              <select name="role" aria-label={t("Rôle")} className={champ}>
                <option value="GESTIONNAIRE">{t("Gestionnaire (peut modifier)")}</option>
                <option value="LECTURE_SEULE">{t("Lecture seule (consultation)")}</option>
              </select>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">{t("Modules accessibles")}</p>
            <ChoixModules refuses={[]} idPrefixe="nouveau" />
            <BoutonEnvoi enCours={t("Création du lien…")} className={`${bouton} self-start`}>{t("Créer l'invitation")}</BoutonEnvoi>
          </form>
        </details>
      )}
      {proprio && forfait.acces === 1 && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("Votre forfait inclut un seul accès.")} <Link href="/abonnement/forfait" className="text-primary font-semibold underline">{t("Passez au forfait Pro")}</Link> {t("pour inviter votre équipe (jusqu'à 5 accès).")}
        </p>
      )}
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {t("Gestionnaire : peut modifier ce que les modules autorisent. Lecture seule : consultation uniquement. L'abonnement, les comptes d'encaissement et l'équipe restent réservés au propriétaire.")}
      </p>
    </section>
  );
}
