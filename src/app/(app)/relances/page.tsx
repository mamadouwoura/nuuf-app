import { Suspense } from "react";
import { redirect } from "next/navigation";
import { relancer, sauverParametresRelance } from "@/app/actions/messages";
import { db } from "@/lib/db";
import { fcfa, initiales, telAffiche } from "@/lib/immo";
import { assurerEcheances, debutMois, loyersDuMois } from "@/lib/loyers";
import { getUser } from "@/lib/session";

type Params = { ok?: string };

async function Contenu({ searchParams }: { searchParams: Promise<Params> }) {
  const { ok } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/connexion");
  const orgId = user.membres[0].organisationId;
  const now = new Date();
  const mois = debutMois(now);
  await assurerEcheances(orgId, mois);

  const [m, reglages, historique] = await Promise.all([
    loyersDuMois(orgId, mois, now),
    db.parametresRelance.findUnique({ where: { organisationId: orgId } }),
    db.relance.findMany({
      where: { echeance: { bail: { bien: { organisationId: orgId } } } },
      orderBy: { envoyeeLe: "desc" },
      take: 8,
      include: { echeance: { include: { bail: { include: { locataire: true } } } } },
    }),
  ]);
  const r = reglages ?? { avantEcheance: true, apresJ1: true, apresJ5: true };
  const retards = m.lignes.filter((l) => l.etat === "EN_RETARD").sort((a, b) => b.jours - a.jours);
  const derniere = new Map<string, Date>();
  for (const h of historique) if (!derniere.has(h.echeanceId)) derniere.set(h.echeanceId, h.envoyeeLe);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold mb-space-xs">
          <span className="material-symbols-outlined text-[18px]">notifications_active</span> Automatisation WhatsApp
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Relances</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Relancez les loyers en retard et réglez les rappels automatiques.</p>
      </div>

      {ok && <p className="rounded-xl bg-emerald-50 text-emerald-800 px-space-md py-2 font-body-md text-body-md">Paramètres enregistrés.</p>}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Loyers en retard</h2>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">{retards.length}</span>
          </div>
          {retards.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">Aucun loyer en retard. 🎉</p>
          ) : (
            <div className="flex flex-col gap-3">
              {retards.map((l) => {
                const loc = l.bail.locataire;
                const d = derniere.get(l.id);
                return (
                  <div key={l.id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">{initiales(loc.nomComplet)}</div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">{loc.nomComplet}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{l.bail.bien.designation} • {telAffiche(loc.telephone)}</span>
                        <span className="font-body-sm text-body-sm text-error font-semibold">{fcfa(l.reste)} FCFA • {l.jours} jour{l.jours > 1 ? "s" : ""} de retard</span>
                        {d && <span className="text-[11px] text-on-surface-variant">Dernière relance : {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>}
                      </div>
                    </div>
                    <form action={relancer}>
                      <input type="hidden" name="echeanceId" value={l.id} />
                      <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#d3f3e2] hover:bg-[#bfe9d3] text-[#0b3d2e] font-label-md text-label-md font-semibold shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">chat</span> Relancer
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form action={sauverParametresRelance} className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Relances automatiques</h2>
          {[
            ["avantEcheance", "Rappel avant l'échéance", "3 jours avant la date de paiement", r.avantEcheance],
            ["apresJ1", "Premier rappel de retard", "Le lendemain de l'échéance", r.apresJ1],
            ["apresJ5", "Second rappel de retard", "5 jours après l'échéance", r.apresJ5],
          ].map(([nom, titre, sous, actif]) => (
            <label key={String(nom)} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer">
              <div>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold block">{String(titre)}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{String(sous)}</span>
              </div>
              <input type="checkbox" name={String(nom)} defaultChecked={Boolean(actif)} className="w-5 h-5 accent-primary" />
            </label>
          ))}
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            L&apos;envoi automatique démarrera dès la connexion de WhatsApp Business à votre compte. En attendant, utilisez « Relancer ».
          </p>
          <button className="h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary">
            Enregistrer les paramètres
          </button>
        </form>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">Historique des relances</h2>
        {historique.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Aucune relance envoyée pour le moment.</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {historique.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">{h.echeance.bail.locataire.nomComplet}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {h.declencheur === "manuelle" ? "Relance manuelle" : h.declencheur} •{" "}
                  {h.envoyeeLe.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="p-space-lg font-body-md text-body-md">Chargement…</p>}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}
