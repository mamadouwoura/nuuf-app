const fs = require("fs");
const lire = (f) => fs.readFileSync(f, "utf8");
const rempl = (s, a, b) => { if (!s.includes(a)) throw new Error("introuvable : " + a.slice(0, 70)); return s.replace(a, () => b); };

// --- page du bilan ---
let f = "src/app/(app)/proprietaires/[id]/bilan/page.tsx", s = lire(f);
s = rempl(s, `      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Reversement")}</h2>`, `      {b.avances.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Remboursement des avances")}</h2>
          <ul className="flex flex-col gap-2">
            {b.avances.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-body-md text-body-md text-on-surface">{a.motif ?? t("Avance")} · {fcfa(a.montantInitial)} FCFA</span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("Reste {n} FCFA après ce bilan", { n: fcfa(a.resteApres) })}</span>
                </span>
                <span className="shrink-0 font-label-lg text-label-lg font-bold text-on-surface">- {fcfa(a.prelevement)} FCFA</span>
              </li>
            ))}
          </ul>
          {!b.reversement && <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Ces montants deviennent définitifs quand vous marquez le mois comme reversé.")}</p>}
        </section>
      )}

      {b.commissionAgent > 0 && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-1">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Part de l'agent (interne)")}</h2>
          <p className="font-body-md text-body-md text-on-surface">
            {t("{nom} : {pct} % soit {montant} FCFA", { nom: b.mandat?.agentNom ?? t("Agent"), pct: String(b.mandat?.commissionAgentPct ?? 0).replace(".", ","), montant: fcfa(b.commissionAgent) })}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Marge de l'agence après l'agent : {n} FCFA. Cette part n'apparaît pas sur le compte rendu du propriétaire.", { n: fcfa(b.margeAgence) })}</p>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Reversement")}</h2>`);
fs.writeFileSync(f, s);

// --- PDF du bilan : lignes d'avances ---
f = "src/lib/bilan-pdf.ts"; s = lire(f);
s = rempl(s, "    ...b.retenues.map((r) => [`Retenue : ${r.libelle}`, `- ${f(r.montant)}`]),", "    ...b.retenues.map((r) => [`Retenue : ${r.libelle}`, `- ${f(r.montant)}`]),\n    ...b.avances.filter((a) => a.prelevement > 0).map((a) => [`Remboursement d'avance${a.motif ? ` (${a.motif})` : \"\"} - reste ${f(a.resteApres)}`, `- ${f(a.prelevement)}`]),");
fs.writeFileSync(f, s);

// --- message WhatsApp ---
f = "src/app/actions/proprietaires.ts"; s = lire(f);
s = rempl(s, "    (b!.totalRetenues ? `, retenues ${fcfa(b!.totalRetenues)} FCFA` : \"\") +", "    (b!.totalRetenues ? `, retenues ${fcfa(b!.totalRetenues)} FCFA` : \"\") +\n    (b!.totalAvances ? `, remboursement d'avance ${fcfa(b!.totalAvances)} FCFA` : \"\") +");
fs.writeFileSync(f, s);

// --- récapitulatif ---
f = "src/app/(app)/bilans/page.tsx"; s = lire(f);
console.log(s.slice(s.indexOf("<section"), s.indexOf("<section") + 1800));
