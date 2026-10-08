import Link from "next/link";
import { Suspense } from "react";
import { PublicFooter, PublicHeader, lienContact } from "@/components/PublicLayout";
import { prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";

type Params = { periode?: string };

const PLANS = [
  {
    code: "BAILLEUR" as const,
    nom: "Bailleur",
    pour: "Propriétaires particuliers",
    logements: "Jusqu'à 15 logements",
    points: ["Encaissement Wave et Orange Money en 1 clic", "Quittances PDF numérotées avec QR code", "Relances WhatsApp en un clic", "Tableau de bord et historique des loyers", "1 utilisateur"],
  },
  {
    code: "PRO" as const,
    nom: "Pro",
    pour: "Bailleurs multi-biens avec équipe",
    logements: "Jusqu'à 50 logements",
    vedette: true,
    points: ["Tout le forfait Bailleur", "5 accès avec rôles : propriétaire, gestionnaire, lecture seule", "Journal des actions de l'équipe", "Support WhatsApp prioritaire"],
  },
  {
    code: "AGENCE" as const,
    nom: "Agence",
    pour: "Agences et cabinets de gestion",
    logements: "Logements illimités",
    points: ["Tout le forfait Pro", "15 accès avec rôles", "25 000 FCFA pour les 50 premiers logements", "puis 300 FCFA par logement supplémentaire"],
  },
];

const LIGNES: [string, string, string, string][] = [
  ["Logements inclus", "15", "50", "Illimité"],
  ["Accès utilisateurs", "1", "5", "15"],
  ["Encaissement Wave & Orange Money", "✓", "✓", "✓"],
  ["Paiements partiels et espèces", "✓", "✓", "✓"],
  ["Quittances PDF + QR code de vérification", "✓", "✓", "✓"],
  ["Relances WhatsApp", "✓", "✓", "✓"],
  ["Rôles et journal d'équipe", "—", "✓", "✓"],
];

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { periode } = await searchParams;
  const annuel = periode === "annuel";
  return (
    <main className="w-full pt-20 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl flex flex-col gap-space-xl">
        <header className="text-center flex flex-col items-center gap-space-sm">
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold">Tarifs transparents</span>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Un prix simple, selon votre nombre de logements</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            14 jours d&apos;essai gratuit, sans carte bancaire. Sans engagement. Aucun pourcentage n&apos;est prélevé sur vos loyers.
          </p>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low mt-space-sm">
            <Link href="/tarifs" className={`px-4 py-2 rounded-lg font-label-lg text-label-lg ${!annuel ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant"}`}>Mensuel</Link>
            <Link href="/tarifs?periode=annuel" className={`px-4 py-2 rounded-lg font-label-lg text-label-lg ${annuel ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant"}`}>
              Annuel • 2 mois offerts
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {PLANS.map((p) => {
            const prix = annuel ? prixAnnuel(p.code, 0) : prixMensuel(p.code, 0);
            return (
              <div key={p.code} className={`relative rounded-xl bg-surface-container-lowest p-space-lg flex flex-col gap-space-md ${p.vedette ? "shadow-xl ring-2 ring-primary-container" : "shadow-sm"}`}>
                {p.vedette && <span className="absolute -top-3 left-space-lg px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">Le plus choisi</span>}
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{p.nom}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">{p.pour}</p>
                  <p className="font-label-lg text-label-lg text-primary font-semibold mt-1">{p.logements}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-currency text-display-currency text-primary">{fcfa(prix)}</span>
                  <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA / {annuel ? "an" : "mois"}</span>
                </div>
                {p.code === "AGENCE" && <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">pour 50 logements, puis 300 FCFA par logement</p>}
                <ul className="flex flex-col gap-2 flex-1">
                  {p.points.map((x) => (
                    <li key={x} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription" className={`h-12 rounded-xl flex items-center justify-center font-label-lg text-label-lg font-bold ${p.vedette ? "bg-primary-container text-on-primary hover:bg-primary" : "bg-surface-container text-primary hover:bg-surface-container-high"}`}>
                  Essayer 14 jours
                </Link>
              </div>
            );
          })}
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg overflow-x-auto">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">Comparer les formules</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 pr-4">Fonctionnalité</th>
                <th className="py-3 px-4">Bailleur</th>
                <th className="py-3 px-4">Pro</th>
                <th className="py-3 px-4">Agence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-md text-body-md">
              {LIGNES.map(([nom, a, b, c]) => (
                <tr key={nom}>
                  <td className="py-3 pr-4 text-on-surface">{nom}</td>
                  {[a, b, c].map((v, i) => (
                    <td key={i} className={`py-3 px-4 ${v === "✓" ? "text-primary font-bold" : "text-on-surface-variant"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl bg-primary-container text-on-primary p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold">Une question avant de vous lancer ?</h2>
            <p className="font-body-md text-body-md opacity-90">Réglez par Wave ou Orange Money. Résiliable à tout moment.</p>
          </div>
          <div className="flex gap-space-sm">
            <Link href="/inscription" className="h-12 px-space-lg rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold flex items-center">Commencer gratuitement</Link>
            <a href={lienContact} target="_blank" className="h-12 px-space-lg rounded-xl bg-on-primary/15 text-on-primary font-label-lg text-label-lg font-semibold flex items-center">Parler à un conseiller</a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <PublicHeader actif="tarifs" />
      <Suspense fallback={<main className="min-h-screen pt-20" />}>
        <Contenu searchParams={searchParams} />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
