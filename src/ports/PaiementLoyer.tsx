// Porté depuis paiement_du_loyer_nuuf/code.html (généré par scripts/port.mjs)
export const bodyClass = "bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen pt-safe pb-safe";

export default function PaiementLoyer() {
  return (
    <>
      <main className="flex-1 flex flex-col relative w-full bg-surface"><div className="flex flex-col w-full px-margin pb-12 pt-2">
      
      <div className="flex items-center justify-center gap-1.5 py-1 px-3 self-center rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md shadow-sm">
      <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
      <span>Lien sécurisé • Connexion chiffrée (HTTPS)</span>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-3 mb-4">
      <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
      <span className="material-symbols-outlined text-secondary-fixed text-[18px]">roofing</span>
      </div>
      <span className="font-headline-md text-headline-md tracking-tight text-primary font-bold">nuuf</span>
      <span className="text-outline-variant font-headline-sm">•</span>
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Paiement sécurisé</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-center">
            Accès instantané 1-clic via WhatsApp • Sans création de compte
          </p>
      </div>
      
      <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="bg-cover bg-center w-full h-full" data-alt="Modern high quality apartment building exterior in Ouakam Dakar Senegal during golden hour warm sunlight clean architectural facade tropical greenery" style={{ backgroundImage: "url('/img/photo-2.jpg')" }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent"></div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-inverse-on-surface">
      <div className="min-w-0 pr-2">
      <div className="flex items-center gap-1">
      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">apartment</span>
      <p className="font-headline-sm text-headline-sm truncate text-inverse-on-surface">Appartement Ouakam 2</p>
      </div>
      <p className="font-body-sm text-body-sm text-inverse-on-surface/80 truncate">Immeuble Teranga, Ouakam • Dakar</p>
      </div>
      <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-inverse-on-surface font-label-md text-label-md shrink-0">
              Octobre 2026
            </span>
      </div>
      </div>
      
      <div className="rounded-xl p-5 bg-surface-container-lowest shadow-md flex flex-col items-center text-center relative overflow-hidden mb-4">
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary-fixed/20 pointer-events-none"></div>
      <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
      <span className="material-symbols-outlined text-[16px] text-primary">request_quote</span>
      <span>Montant net du loyer</span>
      </div>
      
      <div className="flex items-baseline justify-center gap-1.5 my-2">
      <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface font-extrabold tracking-tight">150 000</span>
      <span className="font-label-currency-unit text-label-currency-unit px-2 py-0.5 rounded bg-primary text-on-primary">FCFA</span>
      </div>
      
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-md text-label-md shadow-sm">
      <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      <span>Zéro frais locataire (0 FCFA de frais de transaction)</span>
      </div>
      
      <div className="w-full h-px bg-surface-variant my-4"></div>
      
      <div className="w-full space-y-2.5 text-left font-body-sm text-body-sm">
      <div className="flex items-center justify-between">
      <span className="text-on-surface-variant flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-outline">person_pin</span>
                Bailleur bénéficiaire
              </span>
      <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface">
      <span>Moussa Diop</span>
      <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      </div>
      </div>
      <div className="flex items-center justify-between">
      <span className="text-on-surface-variant flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-outline">badge</span>
                Locataire destinataire
              </span>
      <span className="font-label-md text-label-md text-on-surface">Awa Diallo (+221 77 452 89 12)</span>
      </div>
      <div className="flex items-center justify-between">
      <span className="text-on-surface-variant flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-outline">event_upcoming</span>
                Échéance de paiement
              </span>
      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                05 Octobre 2026
              </span>
      </div>
      </div>
      </div>
      
      <div className="flex items-center justify-between mb-2.5 px-1">
      <span className="font-label-lg text-label-lg text-on-surface">Sélectionnez votre moyen de paiement</span>
      <span className="font-label-md text-label-md text-primary flex items-center gap-0.5">
      <span className="material-symbols-outlined text-[14px]">bolt</span>
            Instantané
          </span>
      </div>
      
      <div className="space-y-3 mb-5">
      
      <button className="w-full p-4 rounded-xl shadow-md flex items-center justify-between text-left active:scale-[0.99] transition-transform bg-[#0c7ab0] text-white" id="wave-pay-btn" type="button">
      <div className="flex items-center gap-3">
      
      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
      <svg className="w-6 h-6 text-[#0c7ab0]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-4-3 4-3v6zm3-8.5l-4 3 4 3V8z" opacity="0.3"></path>
      <path d="M13.5 3.5C7.7 3.5 3 8.2 3 14c0 2.2.7 4.2 1.8 5.9L16.4 8.3c-.9-2.8-2.6-4.8-2.9-4.8zm4.7 3.6L6.6 18.7c1.7 1.1 3.7 1.8 5.9 1.8 5.8 0 10.5-4.7 10.5-10.5 0-1-.2-1.9-.8-2.9z"></path>
      </svg>
      </div>
      <div className="min-w-0">
      <div className="flex items-center gap-1.5">
      <span className="font-headline-sm text-headline-sm font-bold text-white tracking-tight">Payer avec Wave</span>
      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#0c7ab0] uppercase">1-Clic</span>
      </div>
      <p className="text-xs text-white">Ouverture directe de l'application Wave</p>
      </div>
      </div>
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </div>
      </button>
      
      <button className="w-full p-4 rounded-xl shadow-md flex items-center justify-between text-left active:scale-[0.99] transition-transform bg-[#c25400] text-white" id="om-pay-btn" type="button">
      <div className="flex items-center gap-3">
      
      <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm">
      <span className="material-symbols-outlined text-[#FF7900] text-[24px]">phonelink_ring</span>
      </div>
      <div className="min-w-0">
      <div className="flex items-center gap-1.5">
      <span className="font-headline-sm text-headline-sm font-bold text-white tracking-tight">Payer Orange Money</span>
      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black text-[#FF7900] uppercase">Push USSD</span>
      </div>
      <p className="text-xs text-white">Validation par prompt USSD ou code secret</p>
      </div>
      </div>
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </div>
      </button>
      </div>
      
      <div className="hidden rounded-xl p-4 mb-4 bg-primary text-on-primary shadow-lg animate-pulse" id="payment-status-card">
      <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-secondary-fixed text-[26px]">autorenew</span>
      <div className="min-w-0">
      <p className="font-headline-sm text-headline-sm text-on-primary font-bold">Connexion sécurisée en cours...</p>
      <p className="font-body-sm text-body-sm text-on-primary-container">Transmission du montant exact de 150 000 FCFA à votre compte.</p>
      </div>
      </div>
      </div>
      
      <div className="rounded-xl p-4 bg-surface-container-low shadow-sm space-y-3 mb-4">
      <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed mt-0.5">
      <span className="material-symbols-outlined text-[18px]">mark_chat_read</span>
      </div>
      <div>
      <p className="font-label-lg text-label-lg text-on-surface">Quittance instantanée sur WhatsApp</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Paiement sécurisé – votre quittance officielle numérotée vous sera envoyée automatiquement sur votre WhatsApp dès validation.
              </p>
      </div>
      </div>
      <div className="w-full h-px bg-surface-container-highest"></div>
      <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed mt-0.5">
      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
      </div>
      <div>
      <p className="font-label-lg text-label-lg text-on-surface">Rapprochement bancaire immédiat</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Le compte du bailleur Moussa Diop est crédité instantanément. Téléchargement PDF de la quittance disponible immédiatement après paiement.
              </p>
      </div>
      </div>
      </div>
      
      <div className="rounded-xl p-3.5 bg-surface-container shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
              MD
            </div>
      <div className="min-w-0">
      <p className="font-label-md text-label-md text-on-surface">Une question sur ce loyer ?</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Bailleur Moussa Diop (+221 77 123 45 67)</p>
      </div>
      </div>
      <a className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm shrink-0 active:bg-surface-variant transition-colors" href="https://wa.me/221771234567" rel="noopener noreferrer" target="_blank">
      <span className="material-symbols-outlined text-[16px] text-[#178a48]">chat</span>
      <span>Écrire</span>
      </a>
      </div>
      
      
      </div></main>
    </>
  );
}
