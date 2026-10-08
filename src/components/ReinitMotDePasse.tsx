import { lienContact } from "@/components/PublicLayout";
import VoirMotDePasse from "@/components/VoirMotDePasse";
import CodeReinit from "@/components/CodeReinit";
import { demanderReinitialisation, nouveauMotDePasse } from "@/app/actions/reinit";
import { getT } from "@/lib/i18n/server";


export default async function ReinitMotDePasse({ etape, erreur, telephone, devCode }: { etape: 1 | 2 | 3; erreur?: string; telephone: string; devCode?: string | null }) {
  const { t } = await getT();
  return (
    <>
      {(erreur || (etape === 2 && devCode)) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(92vw,28rem)]">
          {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-4 py-2 font-body-md text-body-md shadow-md">{erreur}</p>}
          {etape === 2 && devCode && (
            <p className="rounded-xl bg-secondary-fixed text-on-secondary-fixed px-4 py-2 font-body-md text-body-md shadow-md">
              {t("Mode développement : votre code est")} <strong>{devCode}</strong>
            </p>
          )}
        </div>
      )}
      <header className="fixed top-0 inset-x-0 h-16 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div className="w-full max-w-7xl mx-auto h-16 px-gutter lg:px-margin-desktop flex items-center justify-between"><a className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface transition-colors" href="/connexion"><span className="material-symbols-outlined text-[20px]">arrow_back</span><span className="font-label-md text-label-md">{t("Connexion")}</span></a><div className="flex items-center gap-space-sm"><div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface"><div className="relative flex items-center justify-center"><div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-secondary-container"></div></div></div><span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold lowercase">nuuf</span></div><span className="h-4 w-px bg-outline-variant/60"></span><div className="flex items-center gap-1 text-on-surface-variant"><span className="text-[14px]">🇸🇳</span><span className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider uppercase">{t("SN")}</span></div></div><div className="w-20 flex justify-end"><span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md"><span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>FCFA</span></div></div></header><main className="w-full pt-16 flex-1 flex flex-col justify-center items-center px-gutter py-space-xl"><div className="flex flex-col w-full">
      <div className="relative w-full max-w-7xl mx-auto px-gutter lg:px-margin-desktop py-space-md">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-space-md mb-space-lg">
      <div className="flex items-center gap-space-md">
      <a className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm hover:bg-surface-container text-primary font-label-md text-label-md transition-all" href="/connexion">
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      <span>{t("Retour à la connexion")}</span>
      </a>
      <div className="h-4 w-px bg-outline-variant/40 hidden md:block"></div>
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
      <span className="material-symbols-outlined text-[16px] text-primary">apartment</span>
      <span>{t("Fintech Immobilière • Sénégal")}</span>
      </div>
      </div>
      <div className="flex items-center gap-space-sm">
      <a className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-tertiary font-label-md text-label-md shadow-sm hover:shadow transition-all" href={lienContact} target="_blank">
      <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container"></span>
      </span>
      <span className="material-symbols-outlined text-[18px] text-tertiary">chat</span>
      <span>{t("Support WhatsApp 24/7")}</span>
      </a>
      </div>
      </div>
      
      <div className="text-center max-w-3xl mx-auto mb-space-xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-md text-label-md mb-space-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
      <span>{t("GESTION LOCATIVE & ENCAISSEMENT CERTIFIÉ")}</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              {t("Réinitialisation de votre mot de passe")}
            </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {t("Suivez les 3 étapes simples pour sécuriser et restaurer l'accès à votre compte bailleur en toute conformité.")}
            </p>
      </div>
      
      <div className="relative w-full max-w-5xl mx-auto mb-space-lg hidden lg:block">
      <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 h-0.5 bg-surface-container-highest z-0"></div>
      <div className="absolute top-1/2 left-16 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: etape === 1 ? "0%" : etape === 2 ? "50%" : "100%" }}></div>
      <div className="relative z-10 flex justify-between items-center px-10">
      <div className="flex items-center gap-3 bg-surface px-3 py-1 rounded-full">
      <div className={`${etape >= 1 ? "w-7 h-7 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center text-xs" : "w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant font-headline-sm text-headline-sm flex items-center justify-center text-xs"}${etape === 1 ? " ring-4 ring-primary/20" : ""}`}>1</div>
      <span className="font-label-md text-label-md text-primary font-bold">{t("Identification")}</span>
      </div>
      <div className="flex items-center gap-3 bg-surface px-3 py-1 rounded-full">
      <div className={`${etape >= 2 ? "w-7 h-7 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center text-xs" : "w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant font-headline-sm text-headline-sm flex items-center justify-center text-xs"}${etape === 2 ? " ring-4 ring-primary/20" : ""}`}>2</div>
      <span className="font-label-md text-label-md text-primary font-bold">{t("Code de sécurité")}</span>
      </div>
      <div className="flex items-center gap-3 bg-surface px-3 py-1 rounded-full">
      <div className={`${etape >= 3 ? "w-7 h-7 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center text-xs" : "w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant font-headline-sm text-headline-sm flex items-center justify-center text-xs"}${etape === 3 ? " ring-4 ring-primary/20" : ""}`}>3</div>
      <span className="font-label-md text-label-md text-on-surface-variant">{t("Nouveau mot de passe")}</span>
      </div>
      </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter lg:gap-gutter-desktop items-stretch mb-space-xl">
      
      <div {...(etape !== 1 ? { inert: true } : {})} className={`group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm transition-all ${etape !== 1 ? "opacity-90" : "ring-2 ring-primary-container"}`}>
      <div className="absolute -top-3 left-6">
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-low text-primary font-label-md text-label-md shadow-sm">
      <span className="material-symbols-outlined text-[14px]">looks_one</span>
      <span>{t("Étape 1 • Identification")}</span>
      </span>
      </div>
      <div>
      <div className="flex items-center justify-between mb-space-md pt-space-xs">
      <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[26px]">phone_iphone</span>
      </div>
      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-secondary font-label-md text-label-md flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">lock_open</span>
                    {t("Bailleur Nuuf")}
                  </span>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{t("Mot de passe oublié ?")}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                  {t("Renseignez le numéro de téléphone associé à votre portefeuille pour recevoir un code de vérification.")}
                </p>
      <form action={demanderReinitialisation} className="space-y-space-md" id="step1-form">
      <div>
      <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone-input">
                      {t("Numéro de téléphone mobile")}
                    </label>
      <div className="relative flex items-center rounded-lg bg-surface-container-lowest shadow-inner">
      <div className="flex items-center gap-1 pl-3.5 pr-2 py-2.5 bg-surface-container-low rounded-l-lg text-on-surface font-label-md text-label-md select-none">
      <span className="text-base leading-none">🇸🇳</span>
      <span>+221</span>
      </div>
      <input className="w-full py-2.5 px-3 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none" id="phone-input" name="telephone" placeholder="77 000 00 00" required type="tel" />
      </div>
      <div className="flex items-center justify-between mt-2 text-on-surface-variant font-body-sm text-body-sm">
      <span className="flex items-center gap-1 text-primary">
      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {t("Orange • Wave • Free")}
                      </span>
      <span className="text-outline">{t("Format SN")}</span>
      </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-3 px-space-md rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all active:scale-[0.99] shadow-sm" type="submit">
      <span>{t("Recevoir un code")}</span>
      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
      </form>
      </div>
      <div className="mt-space-lg pt-space-sm flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/60 p-2.5 rounded-lg">
      <span className="material-symbols-outlined text-[18px] text-tertiary">bolt</span>
      <span>{t("Code expédié instantanément sur WhatsApp & SMS sécurisé.")}</span>
      </div>
      </div>
      
      <div {...(etape !== 2 ? { inert: true } : {})} className={`group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm transition-all ${etape !== 2 ? "opacity-90" : "ring-2 ring-primary-container"}`}>
      <div className="absolute -top-3 left-6">
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">
      <span className="material-symbols-outlined text-[14px]">looks_two</span>
      <span>{t("Étape 2 • Vérification")}</span>
      </span>
      </div>
      <div>
      <div className="flex items-center justify-between mb-space-md pt-space-xs">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[26px]">shield_person</span>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-tertiary-container font-label-md text-label-md">
      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                    {t("En attente OTP")}
                  </span>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{t("Code de vérification")}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                  {t("Entrez le code à 6 chiffres transmis avec succès au")} <strong className="text-on-surface font-semibold">{telephone}</strong>.
                </p>
      
      <CodeReinit />
      </div>
      <div className="mt-space-lg pt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/60 p-2.5 rounded-lg">
      <span className="flex items-center gap-1 text-primary">
      <span className="material-symbols-outlined text-[16px]">lock</span>
                  {t("Connexion chiffrée (HTTPS)")}
                </span>
      <span className="text-outline">{t("Session valide 10 min")}</span>
      </div>
      </div>
      
      <div {...(etape !== 3 ? { inert: true } : {})} className={`group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm transition-all ${etape !== 3 ? "opacity-90" : "ring-2 ring-primary-container"}`}>
      <div className="absolute -top-3 left-6">
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-low text-primary font-label-md text-label-md shadow-sm">
      <span className="material-symbols-outlined text-[14px]">looks_3</span>
      <span>{t("Étape 3 • Sécurité")}</span>
      </span>
      </div>
      <div>
      <div className="flex items-center justify-between mb-space-md pt-space-xs">
      <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[26px]">key</span>
      </div>
      <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">encrypted</span>
                    {t("Sécurisé")}
                  </span>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{t("Nouveau mot de passe")}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                  {t("Définissez un mot de passe robuste pour protéger vos encaissements et données de loyers sénégalais.")}
                </p>
      <form action={nouveauMotDePasse} className="space-y-space-md" id="step3-form">
      <div>
      <div className="flex items-center justify-between mb-1.5">
      <label className="font-label-md text-label-md text-on-surface" htmlFor="new-pass">{t("Nouveau mot de passe")}</label>
      <VoirMotDePasse cible="new-pass" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-0.5 text-xs" />
      </div>
      <div className="relative">
      <input className="w-full py-2.5 px-3.5 bg-surface-container rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all" id="new-pass" name="motDePasse" minLength={8} placeholder="••••••••••••" required type="password" />
      </div>
      
      <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1 text-xs">
      <span className="text-on-surface-variant">{t("Robustesse")}</span>
      <span className="font-semibold text-tertiary-container">{t("Optimal & Sécurisé")}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
      <div className="rounded-full bg-tertiary-fixed-dim"></div>
      <div className="rounded-full bg-tertiary-fixed-dim"></div>
      <div className="rounded-full bg-tertiary-fixed-dim"></div>
      <div className="rounded-full bg-tertiary-fixed-dim"></div>
      </div>
      <div className="flex items-center gap-3 mt-2 text-on-surface-variant font-body-sm text-body-sm">
      <span className="flex items-center gap-1 text-primary text-xs">
      <span className="material-symbols-outlined text-[13px]">check_circle</span> {t("8+ car.")}
                        </span>
      <span className="flex items-center gap-1 text-primary text-xs">
      <span className="material-symbols-outlined text-[13px]">check_circle</span> {t("1 Majuscule")}
                        </span>
      <span className="flex items-center gap-1 text-primary text-xs">
      <span className="material-symbols-outlined text-[13px]">check_circle</span> {t("1 Chiffre / Symbole")}
                        </span>
      </div>
      </div>
      </div>
      <div>
      <div className="flex items-center justify-between mb-1.5">
      <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-pass">{t("Confirmer le mot de passe")}</label>
      <span className="text-primary font-label-md text-label-md flex items-center gap-1 text-xs">
      <span className="material-symbols-outlined text-[14px]">check</span> {t("Conforme")}
                      </span>
      </div>
      <div className="relative">
      <input className="w-full py-2.5 px-3.5 bg-surface-container rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all" id="confirm-pass" name="confirmation" minLength={8} placeholder="••••••••••••" required type="password" />
      </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-3 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all active:scale-[0.99] shadow-sm" type="submit">
      <span>{t("Enregistrer et se connecter")}</span>
      <span className="material-symbols-outlined text-[18px]">login</span>
      </button>
      </form>
      </div>
      <div className="mt-space-lg pt-space-sm flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/60 p-2.5 rounded-lg">
      <span className="material-symbols-outlined text-[18px] text-primary">security</span>
      <span>{t("Choisissez un mot de passe que vous n'utilisez nulle part ailleurs.")}</span>
      </div>
      </div>
      </div>
      
      <div className="flex flex-col items-center justify-center gap-space-md max-w-2xl mx-auto text-center py-space-sm">
      <a className="inline-flex items-center gap-2 text-primary font-label-lg text-label-lg hover:underline transition-all" href="/connexion">
      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      <span>{t("Retour à la page de connexion")}</span>
      </a>
      <div className="flex items-center justify-center gap-space-sm p-space-md rounded-xl bg-surface-container-low text-on-surface-variant max-w-lg w-full">
      <span className="material-symbols-outlined text-secondary text-[22px]">contact_support</span>
      <p className="font-body-md text-body-md text-left">
                {t("Un problème d'accès ?")} <a href={lienContact} target="_blank">{t("Contactez le support Nuuf sur WhatsApp")}</a>
      </p>
      </div>
      </div>
      
      <div className="mt-space-xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left text-on-surface-variant font-body-sm text-body-sm opacity-90">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px] text-tertiary">lock</span>
      <span>{t("Connexion chiffrée (HTTPS)")}</span>
      </div>
      <div>
      <span>{t("© Nuuf")}</span>
      </div>
      </div>
      </div>
      </div>
      </main><footer className="w-full py-space-lg bg-surface/90 backdrop-blur-md"><div className="w-full max-w-7xl mx-auto px-gutter lg:px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left"><div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm"><span className="material-symbols-outlined text-[18px] text-primary">verified_user</span><span>{t("Conforme aux normes")} <strong>{t("BCEAO")}</strong> {t("& Code des Obligations Civiles et Commerciales (")}<strong>{t("COCC")}</strong> {t("du Sénégal)")}</span></div><div className="flex items-center gap-space-md text-on-surface-variant font-label-md text-label-md"><span className="text-on-surface-variant hover:text-on-surface transition-colors" >{t("Confidentialité")}</span><span className="text-outline-variant">•</span><span className="text-on-surface-variant hover:text-on-surface transition-colors" >{t("Mentions Légales")}</span><span className="text-outline-variant">•</span><span className="text-outline">{t("© 2025 nuuf Technologies")}</span></div></div></footer>
    </>
  );
}
