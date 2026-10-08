import VoirMotDePasse from "@/components/VoirMotDePasse";
import { lienContact } from "@/components/PublicLayout";
// Porté depuis inscription_bailleur_nuuf/code.html (généré par scripts/port.mjs)
import { inscriptionForm } from "@/app/actions/auth";

export const bodyClass = "bg-background font-body-md text-body-md text-on-background min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed";

export default function Inscription({ erreur }: { erreur?: string }) {
  return (
    <>
      <main className="w-full min-h-screen bg-background"><div className="flex flex-col w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
      
      <div className="lg:col-span-5 xl:col-span-5 bg-tertiary text-on-tertiary flex flex-col justify-between p-6 sm:p-8 lg:p-12 relative overflow-hidden">
      
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tertiary/60 to-tertiary pointer-events-none"></div>
      
      <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary-fixed shadow-md">
      <span className="material-symbols-outlined text-2xl font-bold">roofing</span>
      </div>
      <div>
      <div className="flex items-center space-x-2">
      <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-on-tertiary lowercase leading-none">nuuf</span>
      <span className="text-[10px] font-label-md tracking-widest uppercase bg-primary-fixed-dim/20 text-primary-fixed px-2 py-0.5 rounded-full">Fintech Immobilière</span>
      </div>
      </div>
      </div>
      <div className="inline-flex items-center space-x-1.5 bg-surface-container-lowest/10 px-3 py-1 rounded-full backdrop-blur-sm">
      <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
      <span className="font-label-md text-label-md text-primary-fixed">Sénégal • Gestion Locative</span>
      </div>
      </div>
      <div className="pt-4 space-y-3">
      <p className="font-label-md text-label-md tracking-widest uppercase text-secondary-fixed">Portail Dédié aux Bailleurs</p>
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-tertiary tracking-tight leading-tight">
                  Vos loyers, <span className="text-secondary-fixed underline decoration-secondary-container decoration-2 underline-offset-4">sans courir.</span>
      </h1>
      <p className="font-body-md text-body-md text-primary-fixed-dim max-w-md leading-relaxed">
                  La sérénité absolue pour les propriétaires et gestionnaires à Dakar, Thiès et Mbour. Automatisez vos encaissements et quittances en toute conformité.
                </p>
      </div>
      
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-primary-container/40 p-1.5">
      <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-surface-container-highest">
      <img className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Modern architectural villa in Dakar Almadies with warm terracotta walls, dark green tropical gardens, bougainvillea blossoms, stone patio leading to lap pool at golden hour sunset looking over the Atlantic Ocean in stylized warm flat lighting." src="/img/photo-3.jpg" />
      <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/20 to-transparent"></div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-tertiary">
      <div className="flex items-center space-x-1.5">
      <span className="material-symbols-outlined text-secondary-fixed text-sm">location_on</span>
      <span className="font-label-md text-label-md tracking-tight font-medium text-surface-bright">Patrimoine résidentiel &amp; commercial | Dakar • Almadies • Somone</span>
      </div>
      <span className="font-label-md text-label-md bg-secondary-container/90 text-on-secondary-container font-semibold px-2 py-0.5 rounded">Dakar</span>
      </div>
      </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2.5 pt-2">
      <div className="p-3.5 rounded-xl bg-surface-container-lowest/5 backdrop-blur-md flex items-start space-x-3 transition-colors hover:bg-surface-container-lowest/10">
      <div className="w-8 h-8 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-lg">payments</span>
      </div>
      <div>
      <h4 className="font-label-lg text-label-lg font-bold text-on-tertiary">Wave &amp; Orange Money</h4>
      <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-snug">Encaissement instantané 1-clic direct sur votre compte sans délai ni déplacement.</p>
      </div>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-lowest/5 backdrop-blur-md flex items-start space-x-3 transition-colors hover:bg-surface-container-lowest/10">
      <div className="w-8 h-8 rounded-lg bg-primary-fixed/20 text-primary-fixed flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-lg">verified_user</span>
      </div>
      <div>
      <h4 className="font-label-lg text-label-lg font-bold text-on-tertiary">Quittances avec QR code</h4>
      <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-snug">Génération automatique, numérotée et vérifiable par QR code.</p>
      </div>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-lowest/5 backdrop-blur-md flex items-start space-x-3 transition-colors hover:bg-surface-container-lowest/10">
      <div className="w-8 h-8 rounded-lg bg-secondary-fixed-dim/20 text-secondary-fixed-dim flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-lg">chat</span>
      </div>
      <div>
      <h4 className="font-label-lg text-label-lg font-bold text-on-tertiary">Relances WhatsApp Automatisées</h4>
      <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-snug">Rappels courtois par message direct avec le lien de paiement.</p>
      </div>
      </div>
      </div>
      </div>
      
      <div className="relative z-10 pt-6 mt-6 border-t-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
      <div className="flex -space-x-2 overflow-hidden">
      <span className="inline-block h-8 w-8 rounded-full bg-surface-container-highest ring-2 ring-tertiary flex items-center justify-center text-xs font-bold text-on-surface">AD</span>
      <span className="inline-block h-8 w-8 rounded-full bg-secondary-fixed ring-2 ring-tertiary flex items-center justify-center text-xs font-bold text-on-secondary-fixed">MS</span>
      <span className="inline-block h-8 w-8 rounded-full bg-primary-fixed ring-2 ring-tertiary flex items-center justify-center text-xs font-bold text-on-primary-fixed">FT</span>
      </div>
      <div>
      <p className="font-label-md text-label-md text-on-tertiary font-semibold leading-tight">Bailleurs du Sénégal</p>
      <p className="font-body-sm text-body-sm text-primary-fixed-dim">Dakar, Saly, Thiès</p>
      </div>
      </div>
      <div className="flex items-center space-x-1.5 text-secondary-fixed text-label-md font-label-md">
      <span className="material-symbols-outlined text-sm">lock</span>
      <span>Données chiffrées &amp; protégées</span>
      </div>
      </div>
      </div>
      
      <div className="lg:col-span-7 xl:col-span-7 bg-surface-container-lowest flex flex-col justify-between p-6 sm:p-10 lg:p-16">
      
      <div className="w-full flex items-center justify-between pb-8">
      <div className="flex items-center space-x-2 bg-surface-container-low px-3 py-1.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      <span className="font-label-md text-label-md text-primary font-semibold">Espace propriétaire</span>
      </div>
      <div className="flex items-center space-x-3">
      <a className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition" href={lienContact} target="_blank">
      <span className="material-symbols-outlined text-sm text-primary">support_agent</span>
      <span>Aide WhatsApp</span>
      </a>
      <span className="px-2 py-1 rounded bg-surface-container text-on-surface font-label-md text-label-md">FR</span>
      </div>
      </div>
      
      <div className="max-w-xl w-full mx-auto space-y-8 my-auto py-4">
      
      <div className="space-y-2">
      <span className="inline-block font-label-md text-label-md uppercase tracking-wider text-secondary bg-secondary-fixed/40 px-3 py-1 rounded-full font-bold">
                  Nouveau Compte Bailleur
                </span>
      <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
                  Créer votre compte bailleur
                </h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Automatisez l'encaissement de vos loyers au Sénégal.
                </p>
      </div>
      
      <form action={inscriptionForm} className="space-y-6">
      {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
      
      <div className="space-y-1.5">
      <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="fullname">
                    Prénom et Nom complet
                  </label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-outline text-lg pointer-events-none">person</span>
      <input className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-11 pr-4 py-3 font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-low transition" id="fullname" name="nomComplet" required placeholder="ex. Moussa Diop" type="text" />
      </div>
      </div>
      
      <div className="space-y-1.5">
      <div className="flex items-center justify-between">
      <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="phone">
                      Numéro de téléphone mobile
                    </label>
      <span className="font-body-sm text-body-sm text-secondary font-medium">Pour Wave &amp; OM</span>
      </div>
      <div className="flex rounded-xl shadow-sm bg-surface-container-lowest overflow-hidden">
      <div className="flex items-center space-x-1.5 bg-surface-container-high px-3.5 py-3 text-on-surface select-none font-label-md text-label-md">
      <span className="text-base">🇸🇳</span>
      <span>+221</span>
      </div>
      <input className="w-full bg-surface-container-lowest text-on-surface px-4 py-3 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition" id="phone" name="telephone" required placeholder="77 000 00 00" type="tel" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant pl-1">
                    Recevez les notifications d'encaissements en temps réel via SMS &amp; WhatsApp.
                  </p>
      </div>
      
      <div className="space-y-2">
      <label className="block font-label-md text-label-md text-on-surface font-semibold">
                    Ville principale de vos biens
                  </label>
      <div className="grid grid-cols-4 gap-2" id="city-selector">
      <label className="cursor-pointer"><input type="radio" name="ville" value="Dakar" className="peer sr-only" defaultChecked /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">Dakar</span></label>
      <label className="cursor-pointer"><input type="radio" name="ville" value="Thiès" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">Thiès</span></label>
      <label className="cursor-pointer"><input type="radio" name="ville" value="Mbour" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">Mbour</span></label>
      <label className="cursor-pointer"><input type="radio" name="ville" value="Autre" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">Autre</span></label>
      </div>
      </div>
      
      <div className="space-y-2">
      <label className="block font-label-md text-label-md text-on-surface font-semibold">
                    Nombre de logements ou locaux gérés
                  </label>
      <div className="grid grid-cols-4 gap-2" id="units-selector">
      <label className="cursor-pointer"><input type="radio" name="tailleParc" value="1-5" className="peer sr-only" defaultChecked /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">1 à 5</span></label>
      <label className="cursor-pointer"><input type="radio" name="tailleParc" value="6-20" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">6 à 20</span></label>
      <label className="cursor-pointer"><input type="radio" name="tailleParc" value="21-50" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">21 à 50</span></label>
      <label className="cursor-pointer"><input type="radio" name="tailleParc" value="50+" className="peer sr-only" /><span className="block py-2.5 px-3 rounded-xl font-label-md text-label-md text-center transition bg-surface-container text-on-surface hover:bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:font-bold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">50+</span></label>
      </div>
      </div>
      
      <div className="space-y-1.5">
      <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="password">
                    Créer un mot de passe sécurisé
                  </label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-outline text-lg pointer-events-none">lock</span>
      <input className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-11 pr-12 py-3 font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-low transition" id="password" name="motDePasse" required minLength={8} placeholder="Au moins 8 caractères" type="password" />
      <VoirMotDePasse cible="password" className="absolute right-3.5 top-3.5 text-outline hover:text-on-surface transition" />
      </div>
      <div className="flex items-center space-x-2 pt-1 pl-1">
      <div className="flex space-x-1">
      <span className="w-6 h-1 rounded-full bg-primary"></span>
      <span className="w-6 h-1 rounded-full bg-primary"></span>
      <span className="w-6 h-1 rounded-full bg-primary"></span>
      <span className="w-6 h-1 rounded-full bg-surface-variant"></span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Sécurité optimale (8+ car., chiffres)</span>
      </div>
      </div>
      
      <div className="flex items-start space-x-3 pt-2">
      <input required className="w-5 h-5 rounded accent-primary bg-surface-container-lowest text-primary focus:ring-0 cursor-pointer mt-0.5" id="cgu" type="checkbox" />
      <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer leading-snug" htmlFor="cgu">
                    J'accepte les <a href="/legal/cgu" target="_blank" className="text-primary font-semibold hover:underline" >conditions générales d'utilisation</a> et la <a href="/legal/confidentialite" target="_blank" className="text-primary font-semibold hover:underline">politique de confidentialité</a> de Nuuf.
                  </label>
      </div>
      
      <div className="pt-2 space-y-3">
      <button className="w-full bg-primary hover:bg-tertiary text-on-primary py-4 px-6 rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition transform active:scale-[0.99]" type="submit">
      <span>Créer mon compte bailleur</span>
      <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-xs align-middle text-primary mr-1">check_circle</span>
                    Essai gratuit 30 jours, sans engagement. Aucune carte bancaire requise.
                  </p>
      </div>
      </form>
      
      <div className="pt-4 text-center">
      <p className="font-body-md text-body-md text-on-surface-variant">
                  Vous avez déjà un compte ? 
                  <a className="text-primary font-bold hover:underline ml-1" href="/connexion">Se connecter à mon espace</a>
      </p>
      </div>
      </div>
      
      <div className="w-full pt-8 mt-6 border-t-0 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3">
      <div className="flex items-center space-x-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-sm text-secondary">verified</span>
      <span className="font-body-sm text-body-sm font-medium">Connexion sécurisée (HTTPS)</span>
      </div>
      <div className="flex items-center space-x-4 font-body-sm text-body-sm text-outline">
      <span className="hover:text-on-surface transition" >Mentions légales</span>
      <span>•</span>
      <span className="hover:text-on-surface transition" >Confidentialité</span>
      </div>
      </div>
      </div>
      </div>
      </div>
      </main>
    </>
  );
}
