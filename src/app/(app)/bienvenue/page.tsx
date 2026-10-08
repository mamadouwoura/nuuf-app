import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { lienContact } from "@/components/PublicLayout";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/immo";
import { assurerEcheances, debutMois, loyersDuMois } from "@/lib/loyers";
import { getUser } from "@/lib/session";

export const metadata = { title: "Bienvenue" };

async function Contenu() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const now = new Date();
  const mois = debutMois(now);
  await assurerEcheances(orgId, mois);

  const [nbBiens, nbComptes, nbEncaissements, m] = await Promise.all([
    db.bien.count({ where: { organisationId: orgId, archiveLe: null } }),
    db.compteEncaissement.count({ where: { organisationId: orgId } }),
    db.paiement.count({ where: { statut: "CONFIRME", echeance: { bail: { bien: { organisationId: orgId } } } } }),
    loyersDuMois(orgId, mois, now),
  ]);

  const etapes = [
    {
      titre: "Ajouter votre premier bien et son locataire",
      texte: "Indiquez l'adresse, le type de logement, le loyer en FCFA et le numéro WhatsApp de votre locataire.",
      fait: nbBiens > 0,
      lien: "/biens/nouveau",
      action: "Ajouter un bien",
      indice: ["location_on", "Ex : Almadies, Ouakam, Saly", "payments", "Loyer en FCFA"],
    },
    {
      titre: "Enregistrer votre compte Wave ou Orange Money",
      texte: "Indiquez le numéro sur lequel vous recevez vos loyers.",
      fait: nbComptes > 0,
      lien: "/parametres",
      action: "Ajouter un compte",
      indice: ["contactless", "Wave, Orange Money", "lock", "Vos fonds ne transitent pas par Nuuf"],
    },
    {
      titre: "Encaisser votre premier loyer",
      texte: "Envoyez le lien de paiement à votre locataire par WhatsApp (bouton « Relancer »), ou enregistrez un paiement en espèces.",
      fait: nbEncaissements > 0,
      lien: "/paiements",
      action: "Aller aux paiements",
      indice: ["chat", "Lien Wave et Orange Money", "receipt_long", "Quittance générée automatiquement"],
    },
  ];
  const faites = etapes.filter((e) => e.fait).length;
  const pct = Math.round((faites / etapes.length) * 100);
  const courante = etapes.findIndex((e) => !e.fait);
  const prenom = user.nomComplet.split(" ")[0];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-1">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Encaissé ce mois</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{fcfa(m.encaisse)}</span>
            <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{nbBiens === 0 ? "En attente de votre 1er bien" : `${m.nbRecus} loyer${m.nbRecus > 1 ? "s" : ""} reçu${m.nbRecus > 1 ? "s" : ""}`}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-1">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Biens sous gestion</span>
          <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{nbBiens}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{nbBiens > 1 ? "logements" : "logement"}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-1">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Taux de recouvrement</span>
          <span className="font-display-currency-mobile text-display-currency-mobile text-primary">{m.attendu ? `${Math.round((m.encaisse / m.attendu) * 100)} %` : "-- %"}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{m.nbRetards} loyer{m.nbRetards > 1 ? "s" : ""} en retard</span>
        </div>
      </section>

      <header className="flex flex-col gap-space-sm">
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span> Démarrage rapide
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Bienvenue sur Nuuf, {prenom} ! 👋</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Configurez votre compte en 3 étapes pour encaisser vos loyers et émettre vos quittances.
        </p>
        <div className="max-w-xl">
          <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-1">
            <span>Progression de l&apos;activation</span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }}></div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{faites} sur 3 étapes terminées</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <section className="lg:col-span-7 flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Étapes d&apos;initialisation</h2>
          {etapes.map((e, i) => {
            const active = i === courante;
            const verrou = !e.fait && !active;
            return (
              <article
                key={e.titre}
                className={`rounded-xl p-space-lg flex gap-space-md shadow-sm ${active ? "bg-surface-container-lowest ring-2 ring-primary-container" : "bg-surface-container-lowest"} ${verrou ? "opacity-90" : ""}`}
              >
                <span
                  className={`material-symbols-outlined text-[32px] shrink-0 ${e.fait ? "text-primary" : active ? "text-primary-container" : "text-outline"}`}
                  style={e.fait ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {e.fait ? "check_circle" : verrou ? "lock" : "radio_button_unchecked"}
                </span>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{i + 1}. {e.titre}</h3>
                    {active && <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold">Prioritaire</span>}
                    {e.fait && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-label-md text-label-md font-bold">Terminé</span>}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">{e.texte}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{e.indice[0]}</span>{e.indice[1]}</span>
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{e.indice[2]}</span>{e.indice[3]}</span>
                  </div>
                  {!e.fait && !verrou && (
                    <Link href={e.lien} className="self-start inline-flex items-center gap-2 h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary">
                      {e.action}
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <span className="inline-flex items-center gap-1 font-body-md text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">schedule</span> Temps estimé : moins de 3 minutes
            </span>
            {courante === -1 ? (
              <Link href="/tableau-de-bord" className="inline-flex items-center justify-center gap-2 h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                Aller au tableau de bord <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : (
              <Link href={etapes[courante].lien} className="inline-flex items-center justify-center gap-2 h-12 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {faites === 0 ? "Commencer la configuration" : "Continuer la configuration"} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </section>

        <aside className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Pourquoi configurer dès maintenant ?</h3>
            <ul className="flex flex-col gap-space-sm">
              {[
                ["directions_walk", "Fini la collecte à la main", "Vos locataires paient par Wave ou Orange Money depuis un simple lien."],
                ["receipt_long", "Quittances automatiques", "Une quittance PDF numérotée avec QR code dès que le paiement est confirmé."],
                ["notifications_active", "Relances en un clic", "Un message WhatsApp courtois, avec le lien de paiement, pour les loyers en retard."],
              ].map(([icone, t, d]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">{icone}</span>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface font-semibold">{t}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-primary-container text-on-primary p-space-lg flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">support_agent</span>
              <h4 className="font-headline-sm text-headline-sm font-bold">Besoin d&apos;aide pour débuter ?</h4>
            </div>
            <p className="font-body-md text-body-md opacity-90">Écrivez-nous : nous vous aidons à saisir vos premiers biens et locataires.</p>
            <a href={lienContact} target="_blank" className="self-start inline-flex items-center gap-2 h-11 px-space-lg rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold">
              <span className="material-symbols-outlined text-[18px]">chat</span> Écrire sur WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu />
    </Suspense>
  );
}
