import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { ajouterTransaction, supprimerTransaction } from "@/app/actions/tresorerie";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { formaterDate } from "@/lib/i18n/format";
import { cleMois, debutMois, depuisCle, libelleMois, moisPrecedent } from "@/lib/loyers";
import { CATEGORIES_ENTREE, CATEGORIES_SORTIE, MODES_PAIEMENT, tresorerieDuMois } from "@/lib/tresorerie";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Trésorerie")) };
}

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const LABEL = "block font-label-md text-label-md text-on-surface-variant mb-1";
const CARTE = "bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm";

async function Contenu({ searchParams }: { searchParams: Promise<{ mois?: string; erreur?: string }> }) {
  const { t, locale } = await getT();
  const { mois: cle, erreur } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  const orgId = membre.organisationId;
  const peutEcrire = membre.role !== "LECTURE_SEULE";
  const maintenant = new Date();
  const mois = depuisCle(cle, debutMois(maintenant));
  const [r, proprietaires] = await Promise.all([
    tresorerieDuMois(orgId, mois),
    db.proprietaire.findMany({ where: { organisationId: orgId }, orderBy: { nomComplet: "asc" }, select: { id: true, nomComplet: true } }),
  ]);
  const precedent = cleMois(moisPrecedent(mois, 1));
  const suivant = cleMois(moisPrecedent(mois, -1));
  const cleCourante = cleMois(mois);
  const aujourdhui = (mois.getTime() === debutMois(maintenant).getTime() ? maintenant : mois).toISOString().slice(0, 10);
  const nomProprio = new Map(proprietaires.map((p) => [p.id, p.nomComplet]));

  const lignes: [string, number, string][] = [
    [t("Loyers reçus"), r.loyers, "text-primary"],
    [t("Autres entrées"), r.autresEntrees + r.remboursementsAvances, "text-primary"],
    [t("Reversements aux propriétaires"), -r.reversements, "text-on-surface"],
    [t("Avances consenties"), -r.avances, "text-on-surface"],
    [t("Dépenses"), -r.depenses, "text-on-surface"],
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-4xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Trésorerie")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Le suivi de caisse de votre agence : ce que vous encaissez, reversez et dépensez. Nuuf ne détient aucun fonds.")}</p>
        <div className="mt-2 flex items-center gap-2">
          <Link href={`/tresorerie?mois=${precedent}`} aria-label={t("Mois précédent")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold capitalize min-w-36 text-center">{libelleMois(mois, locale)}</span>
          <Link href={`/tresorerie?mois=${suivant}`} aria-label={t("Mois suivant")} className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
      </div>

      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}

      <section className="grid grid-cols-3 gap-space-sm">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Entrées")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">{fcfa(r.entrees)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Sorties")}</p>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{fcfa(r.sorties)} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
        <div className={`rounded-xl shadow-sm p-space-md ${r.solde >= 0 ? "bg-primary text-on-primary" : "bg-error-container text-on-error-container"}`}>
          <p className="font-body-sm text-body-sm opacity-80">{t("Solde du mois")}</p>
          <p className="font-headline-sm text-headline-sm font-bold">{r.solde < 0 ? "- " : ""}{fcfa(Math.abs(r.solde))} <span className="text-[12px] font-semibold">FCFA</span></p>
        </div>
      </section>

      <section className={CARTE}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Détail du mois")}</h2>
        <ul className="flex flex-col divide-y divide-surface-container">
          <li className="flex items-center justify-between py-2">
            <span className="font-body-md text-body-md text-on-surface-variant">{t("Solde précédent")}</span>
            <span className="font-label-lg text-label-lg font-bold text-on-surface">{r.soldePrecedent < 0 ? "- " : ""}{fcfa(Math.abs(r.soldePrecedent))} FCFA</span>
          </li>
          {lignes.map(([lib, val, cl]) => (
            <li key={lib} className="flex items-center justify-between py-2">
              <span className="font-body-md text-body-md text-on-surface">{lib}</span>
              <span className={`font-label-lg text-label-lg font-bold ${cl}`}>{val < 0 ? "- " : ""}{fcfa(Math.abs(val))} FCFA</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{t("Solde en fin de mois")}</span>
          <span className={`font-label-lg text-label-lg font-bold ${r.soldeFinal >= 0 ? "text-primary" : "text-error"}`}>{r.soldeFinal < 0 ? "- " : ""}{fcfa(Math.abs(r.soldeFinal))} FCFA</span>
        </div>
        {r.depensesParCategorie.length > 0 && (
          <>
            <h3 className="font-label-lg text-label-lg text-on-surface font-semibold mt-2">{t("Dépenses par catégorie")}</h3>
            <ul className="flex flex-col gap-1">
              {r.depensesParCategorie.map((c) => (
                <li key={c.categorie} className="flex items-center justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">{t(c.categorie)}</span>
                  <span className="font-semibold text-on-surface">{fcfa(c.montant)} FCFA</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={CARTE}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Dépenses et autres entrées")}</h2>
        {r.transactions.length === 0 && <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune opération ce mois-ci.")}</p>}
        <ul className="flex flex-col gap-2">
          {r.transactions.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate font-body-md text-body-md text-on-surface">{x.libelle}</span>
                <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">
                  {formaterDate(x.date, locale, { day: "2-digit", month: "short" })} · {t(x.categorie)}
                  {x.modePaiement ? ` · ${t(MODES_PAIEMENT.find((m) => m.code === x.modePaiement)?.libelle ?? x.modePaiement)}` : ""}
                  {x.reference ? ` · ${x.reference}` : ""}
                  {x.proprietaireId && nomProprio.get(x.proprietaireId) ? ` · ${nomProprio.get(x.proprietaireId)}` : ""}
                </span>
              </span>
              <span className="shrink-0 flex items-center gap-2">
                <span className={`font-label-lg text-label-lg font-bold ${x.sens === "ENTREE" ? "text-primary" : "text-on-surface"}`}>
                  {x.sens === "ENTREE" ? "+" : "-"} {fcfa(x.montant)} FCFA
                </span>
                {peutEcrire && (
                  <form action={supprimerTransaction}>
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="mois" value={cleCourante} />
                    <button aria-label={t("Supprimer")} className="w-9 h-9 rounded-lg text-error hover:bg-error-container/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </form>
                )}
              </span>
            </li>
          ))}
        </ul>

        {peutEcrire && (
          <form action={ajouterTransaction} className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-2">
            <div>
              <label htmlFor="tr-sens" className={LABEL}>{t("Type")}</label>
              <select id="tr-sens" name="sens" defaultValue="SORTIE" className={CHAMP}>
                <option value="SORTIE">{t("Dépense")}</option>
                <option value="ENTREE">{t("Entrée")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="tr-categorie" className={LABEL}>{t("Catégorie")}</label>
              <select id="tr-categorie" name="categorie" className={CHAMP}>
                <optgroup label={t("Dépense")}>
                  {CATEGORIES_SORTIE.map((c) => <option key={`s-${c}`} value={c}>{t(c)}</option>)}
                </optgroup>
                <optgroup label={t("Entrée")}>
                  {CATEGORIES_ENTREE.filter((c) => c !== "Autre").map((c) => <option key={`e-${c}`} value={c}>{t(c)}</option>)}
                </optgroup>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tr-libelle" className={LABEL}>{t("Motif")}</label>
              <input id="tr-libelle" name="libelle" required maxLength={100} placeholder={t("Réparation plomberie, loyer du bureau…")} className={CHAMP} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="tr-montant" className={LABEL}>{t("Montant (FCFA)")}</label>
              <input id="tr-montant" name="montant" inputMode="numeric" required placeholder="25 000" className={CHAMP} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="tr-date" className={LABEL}>{t("Date")}</label>
              <input id="tr-date" name="date" type="date" required defaultValue={aujourdhui} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="tr-mode" className={LABEL}>{t("Mode de paiement (facultatif)")}</label>
              <select id="tr-mode" name="modePaiement" defaultValue="" className={CHAMP}>
                <option value="">—</option>
                {MODES_PAIEMENT.map((m) => <option key={m.code} value={m.code}>{t(m.libelle)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tr-ref" className={LABEL}>{t("Référence (facultatif)")}</label>
              <input id="tr-ref" name="reference" maxLength={60} placeholder={t("N° de facture, de virement…")} className={CHAMP} autoComplete="off" />
            </div>
            {proprietaires.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="tr-proprio" className={LABEL}>{t("Propriétaire concerné (facultatif)")}</label>
                <select id="tr-proprio" name="proprietaireId" defaultValue="" className={CHAMP}>
                  <option value="">—</option>
                  {proprietaires.map((p) => <option key={p.id} value={p.id}>{p.nomComplet}</option>)}
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {t("Enregistrer l'opération")}
              </BoutonEnvoi>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default function Page(props: { searchParams: Promise<{ mois?: string; erreur?: string }> }) {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu {...props} />
    </Suspense>
  );
}
