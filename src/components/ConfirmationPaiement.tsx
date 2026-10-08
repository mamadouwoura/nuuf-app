import { getT } from "@/lib/i18n/server";

export type DonneesConfirmation = {
  jetonQr: string; bailleur: string; bailleurInit: string; bailleurTelBrut: string;
  locNom: string; locTel: string; locInit: string; bienNom: string; bienLieu: string;
  periode: string; plage: string; loyer: string; total: string; solde: string; complet: boolean;
  canal: string; dateHeure: string; dateCourte: string; reference: string; numero: string;
  lienPdf: string; lienVerif: string; lienPartage: string; lienBailleur: string;
};

export default async function ConfirmationPaiement({ d }: { d: DonneesConfirmation }) {
  const { t } = await getT();
  return (
    <>
      <main className="flex flex-col relative w-full pt-safe pb-safe bg-surface min-h-screen"><div className="flex flex-col w-full px-margin pb-space-xl space-y-space-lg">
      
      <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-md text-label-md">
      <div className="flex items-center space-x-1.5">
      <span className="inline-flex w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
      <span className="tracking-wide uppercase font-semibold text-primary">nuuf</span>
      <span className="text-outline-variant">•</span>
      <span>{t("Paiement sécurisé")}</span>
      </div>
      <div className="flex items-center space-x-1 text-primary">
      <span className="material-symbols-outlined text-[16px]">verified_user</span>
      <span className="font-medium text-body-sm">{t("Sécurisé")}</span>
      </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm text-center flex flex-col items-center">
      
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary-fixed/40 blur-xl pointer-events-none"></div>
      
      <div className="relative flex items-center justify-center my-space-xs">
      <div className="absolute inset-0 rounded-full bg-primary-container/20 animate-ping opacity-75"></div>
      <div className="relative w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-md shadow-primary-container/25">
      <span className="material-symbols-outlined text-on-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
      </div>
      
      <div className="absolute -top-1 -right-2 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-md text-[10px] shadow-sm flex items-center gap-0.5">
      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      <span>1-Clic</span>
      </div>
      </div>
      
      <h1 className="mt-space-sm font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">
            {d.complet ? t("Loyer réglé avec succès !") : t("Paiement reçu, merci !")}
          </h1>
      <p className="mt-1 font-body-md text-body-md text-on-surface-variant max-w-xs">
            {t("Quittance officielle générée immédiatement pour {nom}.", { nom: d.bailleur })}
          </p>
      
      <div className="mt-space-md flex flex-col items-center justify-center bg-surface-container-low w-full rounded-xl py-space-sm px-space-md">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t("Montant acquitté")}</span>
      <div className="flex items-baseline space-x-1.5 mt-0.5">
      <span className="font-display-currency-mobile text-display-currency-mobile text-primary tracking-tight font-extrabold">{d.total}</span>
      <span className="font-label-currency-unit text-label-currency-unit text-primary">FCFA</span>
      </div>
      <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md">
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      <span>{d.solde}</span>
      </div>
      </div>
      
      <div className="w-full grid grid-cols-2 gap-2 mt-space-md text-left">
      <div className="bg-surface-container/60 p-2.5 rounded-lg flex flex-col justify-between">
      <span className="text-on-surface-variant font-label-md text-[11px]">{t("Date & Heure")}</span>
      <span className="font-label-lg text-label-lg text-on-surface text-[13px] mt-0.5">{d.dateHeure}</span>
      </div>
      <div className="bg-surface-container/60 p-2.5 rounded-lg flex flex-col justify-between">
      <span className="text-on-surface-variant font-label-md text-[11px]">{t("Opérateur")}</span>
      <div className="flex items-center space-x-1 mt-0.5">
      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
      <span className="font-label-lg text-label-lg text-on-surface text-[13px]">{d.canal}</span>
      </div>
      </div>
      </div>
      <div className="w-full mt-2 bg-surface-container/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
      <span className="text-on-surface-variant font-body-sm text-body-sm">{t("Réf. transaction")}</span>
      <span className="font-label-md text-label-md text-primary tracking-mono font-mono">{d.reference}</span>
      </div>
      </div>
      
      <div className="relative w-full rounded-xl bg-surface-container-lowest shadow-md overflow-hidden">
      
      <div className="bg-primary-container px-space-md py-space-sm text-on-primary flex items-center justify-between">
      <div className="flex items-center space-x-2">
      <span className="material-symbols-outlined text-[20px]">description</span>
      <span className="font-label-lg text-label-lg tracking-wide uppercase">{t("Quittance de Loyer")}</span>
      </div>
      <span className="font-label-md text-label-md bg-on-primary/15 px-2 py-0.5 rounded text-primary-fixed">N° {d.numero}</span>
      </div>
      
      <div className="p-space-md space-y-space-md bg-gradient-to-b from-surface-container-lowest to-surface-container-low/30">
      
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-high/70">
      <div className="flex items-center space-x-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
      <span className="font-label-md text-[11px] text-on-surface font-medium">{t("Quittance vérifiable par QR code")}</span>
      </div>
      <span className="font-label-md text-[10px] text-primary uppercase font-bold tracking-wider">{t("Authentifiable")}</span>
      </div>
      
      <div className="space-y-space-sm text-left">
      
      <div className="flex items-start justify-between py-1 border-none">
      <div className="flex flex-col">
      <span className="text-on-surface-variant font-label-md text-label-md">{t("Bailleur / Propriétaire")}</span>
      <span className="font-headline-sm text-[15px] text-on-surface font-semibold">{d.bailleur}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Bailleur")}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                  {d.bailleurInit}
                </div>
      </div>
      <div className="h-[1px] w-full bg-surface-container-highest"></div>
      
      <div className="flex items-start justify-between py-1">
      <div className="flex flex-col">
      <span className="text-on-surface-variant font-label-md text-label-md">{t("Locataire")}</span>
      <span className="font-headline-sm text-[15px] text-on-surface font-semibold">{d.locNom}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{d.locTel}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs">
                  {d.locInit}
                </div>
      </div>
      <div className="h-[1px] w-full bg-surface-container-highest"></div>
      
      <div className="py-1">
      <span className="text-on-surface-variant font-label-md text-label-md">{t("Logement loué")}</span>
      <p className="font-headline-sm text-[14px] text-on-surface font-medium mt-0.5">
                  {d.bienNom}
                </p>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {d.bienLieu}
                </p>
      </div>
      <div className="h-[1px] w-full bg-surface-container-highest"></div>
      
      <div className="flex items-center justify-between py-1">
      <div>
      <span className="text-on-surface-variant font-label-md text-label-md">{t("Période locative")}</span>
      <p className="font-headline-sm text-[14px] text-on-surface font-medium">{t("Loyer {periode}", { periode: d.periode })}</p>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  {d.plage}
                </span>
      </div>
      </div>
      
      <div className="bg-surface-container-low rounded-xl p-space-sm space-y-1.5">
      <div className="flex justify-between items-center text-body-md font-body-md">
      <span className="text-on-surface-variant">{t("Loyer net mensuel")}</span>
      <span className="font-medium text-on-surface">{d.loyer} FCFA</span>
      </div>
      <div className="flex justify-between items-center text-body-md font-body-md">
      <span className="text-on-surface-variant">{t("Charges locatives")}</span>
      <span className="font-medium text-primary">{t("Incluses")}</span>
      </div>
      <div className="h-[1px] w-full bg-surface-container-highest my-1"></div>
      <div className="flex justify-between items-center font-headline-sm text-[15px]">
      <span className="text-on-surface font-bold">{t("Total versé")}</span>
      <span className="text-primary font-bold">{d.total} FCFA</span>
      </div>
      </div>
      
      <div className="pt-space-xs flex items-center justify-between">
      
      <div className="flex items-center space-x-2.5">
      <div className="w-14 h-14 bg-surface-container-lowest p-1 rounded-lg shadow-sm flex items-center justify-center border-none">
      
      <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 40 40">
      <path d="M4 4h12v12H4V4zm4 4v4h4V8H8zM24 4h12v12H24V4zm4 4v4h4V8h-4zM4 24h12v12H4V24zm4 4v4h4v-4H8zM24 24h4v4h-4v-4zm8 0h4v4h-4v-4zm-8 8h4v4h-4v-4zm8 4h4v4h-4v-4zM18 6h4v4h-4V6zm0 8h4v4h-4v-4zm0 8h4v4h-4v-4zm0 8h4v4h-4v-4z"></path>
      </svg>
      </div>
      <div className="flex flex-col">
      <span className="font-label-md text-[11px] text-on-surface-variant font-medium">{t("Contrôle QR Nuuf")}</span>
      <span className="font-body-sm text-[10px] text-outline">{t("Scan anti-fraude actif")}</span>
      </div>
      </div>
      
      <div className="transform -rotate-6 rounded-lg bg-surface-container-highest px-3 py-1.5 shadow-sm text-center flex flex-col items-center">
      <div className="flex items-center space-x-1 text-primary">
      <span className="material-symbols-outlined text-[14px]">verified</span>
      <span className="font-headline-sm text-[11px] font-extrabold uppercase tracking-wider">{t("ACQUITTÉ")}</span>
      </div>
      <span className="font-label-md text-[9px] text-on-surface-variant uppercase">{d.bailleur}</span>
      <span className="font-body-sm text-[8px] text-on-surface-variant">{d.dateCourte}</span>
      </div>
      </div>
      </div>
      </div>
      
      <div className="space-y-space-sm pt-space-xs">
      
      <a className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-headline-sm text-[15px] flex items-center justify-center space-x-2 shadow-md hover:bg-tertiary transition active:scale-[0.98]" href={d.lienPdf} target="_blank">
      <span className="material-symbols-outlined text-[20px]">download</span>
      <span>{t("Télécharger la quittance (PDF)")}</span>
      </a>
      
      <a className="w-full h-12 rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-[15px] flex items-center justify-between px-space-md shadow-sm active:scale-[0.98]" href={d.lienPartage} target="_blank">
      <div className="flex items-center space-x-2.5">
      <span className="w-7 h-7 rounded-full bg-success-container flex items-center justify-center text-success">
      <span className="material-symbols-outlined text-[18px]">chat</span>
      </span>
      <span className="font-medium">{t("Recevoir sur WhatsApp")}</span>
      </div>
      <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-label-md text-[11px] font-semibold">
              {d.locTel}
            </span>
      </a>
      </div>
      
      <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm text-left">
      <div className="flex items-start space-x-2.5">
      <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">mark_email_read</span>
      <div>
      <p className="font-headline-sm text-[13px] text-on-surface font-semibold">{t("Quittance disponible")}</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {t("Conservez cette page : vous pouvez télécharger votre quittance à tout moment avec ce lien.")}
              </p>
      </div>
      </div>
      <div className="h-[1px] w-full bg-surface-container"></div>
      
      <div className="flex items-center justify-between pt-0.5">
      <div className="flex items-center space-x-2">
      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
      <span className="font-body-md text-body-md text-on-surface-variant">{t("Question pour {nom} ?", { nom: d.bailleur })}</span>
      </div>
      <a className="inline-flex items-center space-x-1 text-primary font-headline-sm text-[13px] font-semibold" href={d.lienBailleur} target="_blank">
      <span>{t("Écrire")}</span>
      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
      </a>
      </div>
      </div>
      
      <div className="pt-space-xs text-center">
      <a className="w-full py-3 rounded-lg text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface transition active:opacity-70 block text-center" href={d.lienVerif}>{t("Vérifier cette quittance")}</a>
      </div>
      </div>
      </main>
    </>
  );
}
