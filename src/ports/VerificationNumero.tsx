import { lienContact } from "@/components/PublicLayout";
import OtpForm from "@/components/OtpForm";
import { getT } from "@/lib/i18n/server";

// Porté depuis v_rification_du_num_ro_nuuf/code.html (généré par scripts/port.mjs)
export const bodyClass = "bg-background font-body-md text-body-md text-on-background min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed";

export default async function VerificationNumero({ erreur, devCode, telephone }: { erreur?: string; devCode?: string | null; telephone?: string }) {
  const { t } = await getT();
  return (
    <>
      <main className="w-full min-h-screen bg-background"><div className="flex flex-col w-full">
      <div className="relative w-full overflow-x-clip min-h-[92vh] flex flex-col justify-between items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 -right-24 w-[420px] h-[360px] bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <header className="w-full max-w-4xl flex items-center justify-between py-4">
      <a className="inline-flex items-center gap-2 group text-on-surface-variant hover:text-primary transition-colors" href="/connexion">
      <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-surface-container-high transition-colors">
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      </span>
      <span className="font-body-md text-body-md font-medium text-on-surface-variant">{t("Retour")}</span>
      </a>
      <div className="flex items-center gap-2.5">
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span className="font-label-md text-label-md font-semibold text-primary">{t("Fintech Immobilière • Sénégal")}</span>
      </div>
      <a className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface-variant font-label-md text-label-md" href={lienContact} rel="noopener noreferrer" target="_blank">
      <span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      <span>{t("Aide WhatsApp")}</span>
      </a>
      </div>
      </header>
      <div className="w-full max-w-lg my-auto pt-4 pb-8">
      <div className="flex flex-col items-center mb-6 text-center">
      <div className="flex items-center gap-2 mb-2">
      <span className="font-headline-lg text-headline-lg font-black tracking-tight text-primary">nuuf</span>
      <span className="w-2 h-2 rounded-full bg-secondary-container mt-2"></span>
      </div>
      <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t("Gestion locative & encaissement")}</p>
      </div>
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-xl shadow-primary/5 flex flex-col items-center">
      <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container shadow-inner">
      <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sms</span>
      </div>
      <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
      <span className="material-symbols-outlined text-base">verified_user</span>
      </div>
      </div>
      <div className="text-center w-full mb-8">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-semibold mb-3">
      <span className="material-symbols-outlined text-xs">lock</span>
      <span>{t("Protocole OTP 2FA")}</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t("Vérifiez votre numéro")}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  {t("Nous venons d'expédier un code unique à 6 chiffres par")} <strong className="text-on-surface font-semibold">{t("WhatsApp & SMS")}</strong> {t("au numéro :")}
                </p>
      <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-surface-container">
      <span className="font-label-lg text-label-lg font-bold text-primary tracking-wide">{telephone ?? "+221"}</span>
      <a className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center" title={t("Modifier le numéro")} href="/connexion">
      <span className="material-symbols-outlined text-sm">edit</span>
      </a>
      </div>
      </div>
      <OtpForm erreur={erreur} devCode={devCode} />
      
      <div className="mt-8 pt-6 w-full flex items-center justify-center gap-2 text-on-surface-variant/80">
      <span className="material-symbols-outlined text-sm text-emerald-700">lock</span>
      <p className="font-body-sm text-body-sm text-center text-on-surface-variant">
                  {t("Connexion chiffrée (HTTPS) • Vos données restent confidentielles")}
                </p>
      </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-6 text-on-surface-variant font-label-md text-label-md">
      <a className="hover:text-primary transition-colors" href="/connexion">{t("Mauvais numéro ?")}</a>
      <span>•</span>
      <a className="hover:text-primary transition-colors" href="/legal/cgu">{t("Conditions générales")}</a>
      <span>•</span>
      <a className="hover:text-primary transition-colors" href={lienContact} target="_blank">{t("Assistance WhatsApp")}</a>
      </div>
      </div>
      <footer className="w-full max-w-4xl py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-body-sm text-body-sm">
      <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-success"></span>
      <span>{t("Connexion chiffrée (HTTPS)")}</span>
      </div>
      <div>
      <span>{t("© Nuuf. Tous droits réservés.")}</span>
      </div>
      </footer>
      </div>
      
      </div></main>
    </>
  );
}
