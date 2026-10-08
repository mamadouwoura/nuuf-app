import { lienContact } from "@/components/PublicLayout";
import VoirMotDePasse from "@/components/VoirMotDePasse";
// Porté depuis page_d_accueil_connexion_nuuf/code.html (généré par scripts/port.mjs)
import { connexionForm } from "@/app/actions/auth";

export const bodyClass = "bg-background font-body-md text-body-md text-on-background min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed";

export default function Connexion({ erreur, info }: { erreur?: string; info?: string }) {
  return (
    <>
      <main className="w-full min-h-screen bg-background"><div className="flex flex-col w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full min-h-[960px] lg:h-screen overflow-hidden">
      
      <div className="lg:col-span-7 bg-[#175a4a] text-on-primary flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
      
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-secondary-container opacity-15 blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-md">
      <span className="font-headline-lg text-primary font-extrabold tracking-tighter leading-none lowercase">n</span>
      <div className="w-2 h-2 rounded-full bg-secondary-container -mt-3 -ml-0.5"></div>
      </div>
      <div className="flex flex-col">
      <span className="font-headline-md text-on-primary tracking-tight font-bold lowercase leading-none">nuuf</span>
      <span className="font-body-sm text-primary-fixed-dim uppercase tracking-wider text-[10px] mt-0.5">Fintech Immobilière</span>
      </div>
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                  Sénégal • Gestion Locative
                </span>
      </div>
      
      <div className="pt-4 max-w-xl">
      <p className="font-label-lg text-secondary-fixed-dim uppercase tracking-widest text-xs mb-2 font-semibold">Portail Dédié Aux Bailleurs</p>
      <h1 className="font-headline-lg text-on-primary text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                  Vos loyers, sans courir.
                </h1>
      <p className="font-body-lg text-primary-fixed-dim mt-3 max-w-lg leading-relaxed">
                  La sérénité absolue pour les propriétaires et gestionnaires à Dakar, Thiès et Mbour. Automatisez vos encaissements et quittances en toute conformité.
                </p>
      </div>
      </div>
      
      <div className="relative z-10 my-6 space-y-6">
      
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-primary-container/40 p-2 group">
      <div className="h-44 sm:h-52 w-full rounded-xl overflow-hidden relative">
      <img alt="Villa d'architecte contemporaine à Dakar bord d'océan au crépuscule" className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out" src="/img/photo-4.jpg" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary-container text-sm">verified</span>
      <span className="font-label-md text-xs text-surface">Patrimoine résidentiel &amp; commercial</span>
      </div>
      <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-primary/70 backdrop-blur-sm text-primary-fixed-dim">
                      Dakar • Almadies • Somone
                    </span>
      </div>
      </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 rounded-xl bg-primary-container/70 backdrop-blur-sm transition-all hover:bg-primary-container">
      <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center text-secondary-container mb-2">
      <span className="material-symbols-outlined text-lg">payments</span>
      </div>
      <h3 className="font-label-lg text-on-primary text-sm font-semibold leading-tight">Wave &amp; Orange Money</h3>
      <p className="font-body-sm text-primary-fixed-dim mt-1 text-xs leading-normal">
                    Encaissement instantané 1-clic direct sur votre compte sans délai.
                  </p>
      </div>
      <div className="p-3.5 rounded-xl bg-primary-container/70 backdrop-blur-sm transition-all hover:bg-primary-container">
      <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center text-tertiary-fixed-dim mb-2">
      <span className="material-symbols-outlined text-lg">receipt_long</span>
      </div>
      <h3 className="font-label-lg text-on-primary text-sm font-semibold leading-tight">Quittances PDF</h3>
      <p className="font-body-sm text-primary-fixed-dim mt-1 text-xs leading-normal">
                    Génération automatique avec QR code de vérification.
                  </p>
      </div>
      <div className="p-3.5 rounded-xl bg-primary-container/70 backdrop-blur-sm transition-all hover:bg-primary-container">
      <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center text-secondary-fixed-dim mb-2">
      <span className="material-symbols-outlined text-lg">chat</span>
      </div>
      <h3 className="font-label-lg text-on-primary text-sm font-semibold leading-tight">Relances WhatsApp</h3>
      <p className="font-body-sm text-primary-fixed-dim mt-1 text-xs leading-normal">
                    Rappels courtois par WhatsApp, avec le lien de paiement.
                  </p>
      </div>
      </div>
      </div>
      
      <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-primary-fixed-dim">
      <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5 overflow-hidden">
      
      </div>
      <span className="font-label-md text-surface">Pensé pour les bailleurs du Sénégal</span>
      </div>
      <div className="flex items-center gap-1.5 font-label-md text-secondary-fixed-dim">
      <span className="material-symbols-outlined text-sm">security</span>
      <span>Données hébergées &amp; protégées</span>
      </div>
      </div>
      </div>
      
      <div className="lg:col-span-5 bg-surface-container-lowest text-on-surface flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
      
      <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
      <span className="font-label-md text-xs text-on-surface-variant">Espace propriétaire</span>
      </div>
      <div className="flex items-center gap-3">
      <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-xs hover:bg-surface-variant transition-colors" href={lienContact} rel="noopener noreferrer" target="_blank">
      <span className="material-symbols-outlined text-sm text-primary">support_agent</span>
      <span>Aide WhatsApp</span>
      </a>
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-xs">
      <span className="font-bold">FR</span>
      </div>
      </div>
      </div>
      
      <div className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
      <div>
      <span className="px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-md text-[11px] font-bold tracking-wide uppercase">
                  Accès sécurisé
                </span>
      <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-extrabold mt-3 tracking-tight">
                  Bienvenue sur Nuuf
                </h2>
      <p className="font-body-md text-on-surface-variant mt-1.5">
                  Accédez à votre portefeuille de biens et pilotez vos encaissements en direct.
                </p>
      </div>
      <form action={connexionForm} className="space-y-4">
      {info && <p className="rounded-xl bg-emerald-50 text-emerald-800 px-3 py-2 font-body-md text-body-md">{info}</p>}
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
      
      <div className="space-y-1.5">
      <label className="block font-label-lg text-xs text-on-surface font-semibold tracking-wide">
                    Numéro de téléphone mobile
                  </label>
      <div className="relative flex rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
      <div className="flex items-center pl-3.5 pr-2 gap-1.5 text-on-surface-variant font-label-lg text-sm select-none">
      
      <svg aria-label="Drapeau Sénégal" className="w-5 h-3.5 rounded-sm overflow-hidden" viewBox="0 0 900 600">
      <rect fill="#00853f" height="600" width="300"></rect>
      <rect fill="#fdef42" height="600" width="300" x="300"></rect>
      <rect fill="#e31b23" height="600" width="300" x="600"></rect>
      <polygon fill="#00853f" points="450,230 468,284 525,284 479,317 497,370 450,337 403,370 421,317 375,284 432,284"></polygon>
      </svg>
      <span className="font-semibold text-on-surface">+221</span>
      <span className="material-symbols-outlined text-base text-outline">expand_more</span>
      </div>
      <input autoComplete="tel" className="w-full py-3.5 px-3 bg-transparent text-on-surface font-headline-sm text-base placeholder:text-outline focus:outline-none" id="phone-input" maxLength={12} name="telephone" placeholder="77 000 00 00" required type="tel" />
      </div>
      <p className="font-body-sm text-[11px] text-on-surface-variant">Compatible Orange Money, Wave et Free Money.</p>
      </div>
      
      <div className="space-y-1.5">
      <div className="flex items-center justify-between">
      <label className="block font-label-lg text-xs text-on-surface font-semibold tracking-wide">
                      Mot de passe
                    </label>
      <a className="font-label-md text-xs text-primary hover:underline transition-all" href="/mot-de-passe-oublie">
                      Mot de passe oublié ?
                    </a>
      </div>
      <div className="relative flex items-center rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
      <span className="material-symbols-outlined absolute left-3.5 text-outline text-lg pointer-events-none">lock</span>
      <input className="w-full py-3.5 pl-10 pr-11 bg-transparent text-on-surface font-body-lg text-sm placeholder:text-outline focus:outline-none" id="password-input" name="motDePasse" placeholder="••••••••••••" required type="password" />
      <VoirMotDePasse cible="password-input" className="absolute right-3.5 p-1 text-outline hover:text-on-surface focus:outline-none flex items-center" />
      </div>
      </div>
      
      <div className="flex items-center justify-between pt-1">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer" id="remember-me" type="checkbox" />
      <span className="font-body-sm text-xs text-on-surface">Mémoriser cet appareil pendant 30 jours</span>
      </label>
      </div>
      
      <button className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99]" id="submit-btn" type="submit">
      <span>Se connecter à mon espace</span>
      <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
      
      
      </form>
      
      <div className="text-center pt-2">
      <p className="font-body-md text-xs text-on-surface-variant">
                  Vous louez un bien mais n'avez pas de compte ?
                  <a className="font-label-lg font-bold text-primary hover:underline ml-1" href="/inscription">
                    Créer mon compte bailleur
                  </a>
      </p>
      </div>
      </div>
      
      <div className="w-full pt-4 text-center">
      <p className="font-body-sm text-[11px] text-outline">
                Connexion sécurisée (HTTPS) • Vos données restent confidentielles.
              </p>
      </div>
      </div>
      </div>
      
      </div></main>
    </>
  );
}
