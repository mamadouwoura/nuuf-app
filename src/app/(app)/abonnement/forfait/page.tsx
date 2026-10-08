import { Suspense } from "react";
import { redirect } from "next/navigation";
import { souscrire } from "@/app/actions/abonnement";
import { db } from "@/lib/db";
import { etatAcces } from "@/lib/abonnement";
import { FORFAITS, prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Choisir un forfait")) };
}

type Params = { erreur?: string };

const CARTES = [
  {
    code: "BAILLEUR" as const,
    titre: N_("Bailleur"),
    pour: N_("Propriétaires particuliers (1 utilisateur)"),
    points: [N_("Jusqu'à 15 logements"), N_("Relances WhatsApp"), N_("Quittances PDF numérotées"), N_("Paiement Wave & Orange Money")],
  },
  {
    code: "PRO" as const,
    titre: "Pro",
    pour: N_("Bailleurs multi-biens avec une équipe"),
    points: [N_("Jusqu'à 50 logements"), N_("5 accès avec rôles (assistante, frère, gérant)"), N_("Tout le forfait Bailleur"), N_("Support WhatsApp prioritaire")],
    vedette: true,
  },
  {
    code: "AGENCE" as const,
    titre: N_("Agence"),
    pour: N_("Agences et cabinets de gestion"),
    points: [N_("25 000 FCFA pour 50 logements"), N_("puis 300 FCFA par logement supplémentaire"), N_("15 accès avec rôles"), N_("Logements illimités")],
  },
];

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { t, tn } = await getT();
  const { erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const abo = membre.organisation.abonnement;
  const acces = etatAcces(abo);
  const nb = await db.bien.count({ where: { organisationId: membre.organisationId, archiveLe: null } });
  const proprietaire = membre.role === "PROPRIETAIRE";
  const equipe = await db.membre.count({ where: { organisationId: membre.organisationId } });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Activer votre abonnement Nuuf")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("Sans engagement, résiliable à tout moment.")} {tn(nb, "Vous gérez actuellement {n} logement.", "Vous gérez actuellement {n} logements.")}
        </p>
      </div>

      {acces.etat === "ESSAI" && (
        <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-space-md py-2 font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
          {tn(acces.joursRestants ?? 0, "{n} jour d'essai restant • vos données sont conservées.", "{n} jours d'essai restants • vos données sont conservées.")}
        </p>
      )}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">{erreur}</p>}
      {!proprietaire && (
        <p className="rounded-xl bg-surface-container text-on-surface px-space-md py-2 font-body-md text-body-md">
          {t("Seul le propriétaire du compte peut modifier l'abonnement.")}
        </p>
      )}

      <form action={souscrire} className="group/form flex flex-col gap-space-lg">
        <fieldset className="flex items-center gap-2 p-1 rounded-xl bg-surface-container-low self-start">
          <legend className="sr-only">{t("Périodicité")}</legend>
          {[
            ["mensuel", t("Mensuel")],
            ["annuel", t("Annuel • 2 mois offerts")],
          ].map(([v, l]) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="periodicite" value={v} defaultChecked={v === "mensuel"} className="peer sr-only" />
              <span className="block px-4 py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant peer-checked:bg-primary-container peer-checked:text-on-primary">{l}</span>
            </label>
          ))}
        </fieldset>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {CARTES.map((c) => {
            const tropLogements = nb > FORFAITS[c.code].logements;
            const tropEquipe = equipe > FORFAITS[c.code].acces;
            const trop = tropLogements || tropEquipe;
            return (
              <label key={c.code} className={`relative cursor-pointer ${trop ? "opacity-90 pointer-events-none" : ""}`}>
                <input type="radio" name="forfait" value={c.code} required disabled={trop || !proprietaire} defaultChecked={abo?.forfait === c.code} className="peer sr-only" />
                <div className="h-full rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-sm border-2 border-transparent peer-checked:border-primary-container peer-checked:shadow-md">
                  {c.vedette && <span className="absolute -top-3 left-space-lg px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">{t("Recommandé")}</span>}
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t(c.titre)}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t(c.pour)}</p>
                  <div className="flex items-baseline gap-1 group-has-[input[value=annuel]:checked]/form:hidden">
                    <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(prixMensuel(c.code, nb))}</span>
                    <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">{t("FCFA / mois")}</span>
                  </div>
                  <div className="hidden items-baseline gap-1 group-has-[input[value=annuel]:checked]/form:flex">
                    <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(prixAnnuel(c.code, nb))}</span>
                    <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">{t("FCFA / an")}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant group-has-[input[value=annuel]:checked]/form:hidden">{t("ou {montant} FCFA / an (2 mois offerts)", { montant: fcfa(prixAnnuel(c.code, nb)) })}</p>
                  <p className="hidden font-body-sm text-body-sm text-on-surface-variant group-has-[input[value=annuel]:checked]/form:block">{t("soit {montant} FCFA / mois", { montant: fcfa(Math.round(prixAnnuel(c.code, nb) / 12)) })}</p>
                  <ul className="flex flex-col gap-1.5 mt-2">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                        {t(p)}
                      </li>
                    ))}
                  </ul>
                  {tropLogements && <p className="font-body-sm text-body-sm text-error mt-2">{tn(FORFAITS[c.code].logements, "Limité à {max} logement : vous en gérez {nb}.", "Limité à {max} logements : vous en gérez {nb}.", { max: FORFAITS[c.code].logements, nb })}</p>}
                  {tropEquipe && <p className="font-body-sm text-body-sm text-error mt-2">{tn(FORFAITS[c.code].acces, "Limité à {max} seul accès : retirez d'abord {n} membre(s) dans Paramètres.", "Limité à {max} accès : retirez d'abord {n} membre(s) dans Paramètres.", { max: FORFAITS[c.code].acces, n: equipe - FORFAITS[c.code].acces })}</p>}
                </div>
              </label>
            );
          })}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-label-lg text-label-lg text-on-surface font-semibold mb-1">{t("Payer avec")}</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm max-w-xl">
            <label className="cursor-pointer">
              <input type="radio" name="canal" value="WAVE" defaultChecked className="peer sr-only" />
              <span className="flex items-center gap-2 p-3 rounded-xl bg-[#1BA7DE]/10 text-on-surface font-label-lg text-label-lg peer-checked:ring-2 peer-checked:ring-[#1BA7DE]">Wave</span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="canal" value="ORANGE_MONEY" className="peer sr-only" />
              <span className="flex items-center gap-2 p-3 rounded-xl bg-[#FF7900]/10 text-on-surface font-label-lg text-label-lg peer-checked:ring-2 peer-checked:ring-[#FF7900]">Orange Money</span>
            </label>
          </div>
        </fieldset>

        <button disabled={!proprietaire} className="h-14 max-w-xl rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold hover:bg-primary disabled:opacity-60">
          {t("Continuer vers le paiement")}
        </button>
      </form>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">{t("Chargement…")}</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
