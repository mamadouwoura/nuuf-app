import Link from "next/link";

type Infos = {
  bien: string;
  lieu: string;
  mois: string;
  montant: string;
  bailleur: string;
  bailleurInit: string;
  bailleurTel: string;
  bailleurWa: string;
};

/** Écrans locataire : échec de paiement ou lien expiré (styles repris des maquettes). */
export default function EcranEchec({
  variante,
  d,
  jeton,
  detail,
}: {
  variante: "echec" | "expire" | "invalide";
  d?: Infos;
  jeton?: string;
  detail?: { canal: string; date: string; reference: string };
}) {
  return (
    <main className="flex-1 w-full max-w-md mx-auto px-margin py-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-center gap-1.5">
        <span className="font-headline-md text-headline-md tracking-tight text-primary font-bold">nuuf</span>
        <span className="text-outline-variant">•</span>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Paiement sécurisé</span>
      </div>

      {variante === "invalide" || !d ? (
        <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg text-center flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[48px] text-error">link_off</span>
          <h1 className="font-headline-md text-headline-md text-on-surface">Lien invalide</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Ce lien de paiement n&apos;existe pas. Demandez-en un nouveau à votre bailleur.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-label-lg text-label-lg text-on-surface truncate">{d.bien}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{d.lieu} • Bailleur : {d.bailleur}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-label-md text-label-md text-on-surface-variant">{d.mois}</p>
              <p className="font-label-lg text-label-lg text-on-surface font-bold">{d.montant} FCFA</p>
            </div>
          </div>

          {variante === "echec" ? (
            <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning_amber</span>
              <h1 className="font-headline-md text-headline-md text-on-surface">Le paiement n&apos;a pas abouti</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                La transaction n&apos;a pas pu être validée (solde insuffisant ou opération interrompue depuis l&apos;application).
              </p>
              <div className="w-full rounded-xl bg-emerald-50 text-emerald-800 px-3 py-2 flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="font-label-md text-label-md">Aucun montant n&apos;a été débité de votre compte.</span>
              </div>
              {detail && (
                <dl className="w-full text-left font-body-sm text-body-sm flex flex-col gap-1.5">
                  {[["Canal", detail.canal], ["Date et heure", detail.date], ["Référence", detail.reference]].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-surface-container pb-1.5">
                      <dt className="text-on-surface-variant">{k}</dt>
                      <dd className="text-on-surface font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <Link href={`/paiement/${jeton}`} className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                Réessayer le paiement
              </Link>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-secondary">history_toggle_off</span>
              <h1 className="font-headline-md text-headline-md text-on-surface">Ce lien a expiré</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Demandez un nouveau lien à votre bailleur.</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Pour protéger vos transactions, les liens de paiement Nuuf sont valables 72 heures. Le lien pour le loyer de {d.mois} ({d.montant} FCFA) n&apos;est plus actif.
              </p>
              <div className="w-full rounded-xl bg-surface-container p-3 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">{d.bailleurInit}</div>
                <div className="min-w-0">
                  <p className="font-label-lg text-label-lg text-on-surface">{d.bailleur}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{d.bailleurTel}</p>
                </div>
              </div>
              <a
                href={d.bailleurWa}
                target="_blank"
                className="w-full h-12 rounded-xl bg-[#d3f3e2] text-[#0b3d2e] font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-[#bfe9d3]"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Contacter le bailleur sur WhatsApp
              </a>
            </div>
          )}
        </>
      )}
    </main>
  );
}
