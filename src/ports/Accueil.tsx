// Porté depuis page_d_accueil_nuuf/code.html (généré par scripts/port.mjs)
export const bodyClass = "bg-background font-body-md text-on-surface antialiased";

export default function Accueil() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div className="h-20 w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between"><a className="flex items-center gap-space-sm group" data-path="accueil" href="#"><div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-container text-on-primary-container"><span className="material-symbols-outlined text-[24px]">apartment</span></div><div className="flex flex-col"><span className="font-headline-md text-headline-md tracking-tight text-primary leading-none lowercase">nuuf</span><span className="font-label-md text-[10px] text-secondary leading-none uppercase tracking-widest mt-1">Sénégal</span></div></a><nav className="hidden md:flex items-center gap-space-md lg:gap-space-lg" data-active-classes="bg-primary-container text-on-primary-container font-label-lg rounded-xl"><a aria-current="page" className="px-space-sm py-space-xs transition-colors bg-primary-container text-on-primary-container font-label-lg rounded-xl" data-path="accueil" href="#">Accueil</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors" data-path="fonctionnalites" href="#">Fonctionnalités</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors" data-path="paiements-locatifs" href="#">Paiements Wave & OM</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors" data-path="tarifs" href="#">Tarifs</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors" data-path="contact-commercial" href="#">Contact</a></nav><div className="flex items-center gap-space-md"><a className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-primary hover:text-primary-container px-space-md py-space-sm transition-colors" data-path="connexion" href="#">Se connecter</a><a className="inline-flex items-center justify-center h-12 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm" data-path="inscription" href="#">Essai gratuit</a><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-20 bg-background min-h-screen"><div className="flex flex-col w-full">
      
      <section className="relative w-full overflow-hidden bg-background pt-8 pb-20 lg:pt-14 lg:pb-28">
      
      <div className="pointer-events-none absolute -top-40 right-0 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-primary-fixed/40 via-surface-tint/10 to-transparent blur-3xl -z-10"></div>
      <div className="pointer-events-none absolute top-1/2 -left-36 w-[480px] h-[480px] rounded-full bg-secondary-fixed/30 blur-3xl -z-10"></div>
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      
      <div className="lg:col-span-6 flex flex-col items-start space-y-6">
      
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high shadow-sm">
      <span className="text-base leading-none">🇸🇳</span>
      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                    La 1ère plateforme de gestion locative au Sénégal • Conforme BCEAO & COCC
                  </span>
      </div>
      
      <h1 className="font-headline-lg text-headline-lg md:text-[52px] md:leading-[1.1] tracking-tight text-on-surface font-extrabold">
                  Vos loyers, <span className="text-primary italic font-serif tracking-normal">sans courir.</span>
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  Nuuf encaisse vos loyers par <strong className="text-on-surface font-semibold">Wave</strong> et <strong className="text-on-surface font-semibold">Orange Money</strong>, expédie automatiquement les quittances officielles certifiées et pilote vos relances avec tact.
                </p>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
      <a className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-md group" data-path="inscription" href="#">
      <span>Essayer gratuitement 30 jours</span>
      <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
      </a>
      <button className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-xl bg-surface-container-highest text-primary font-label-lg text-label-lg hover:bg-surface-variant transition-colors" id="trigger-demo" type="button">
      <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
      <span>Voir une démo interactive</span>
      </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-on-surface-variant font-body-sm text-body-sm pt-2">
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
      <span>Sans carte bancaire</span>
      </div>
      <span className="hidden sm:inline text-outline-variant">•</span>
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">event_available</span>
      <span>30 jours d'essai</span>
      </div>
      <span className="hidden sm:inline text-outline-variant">•</span>
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
      <span>Configuration en 3 minutes</span>
      </div>
      </div>
      </div>
      
      <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
      
      <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-surface-container-high to-primary-fixed/20 rounded-3xl transform rotate-1 scale-95 -z-10 shadow-inner"></div>
      
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden p-4 md:p-6 space-y-4">
      
      <div className="flex items-center justify-between pb-3 bg-surface-container-lowest">
      <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-error"></div>
      <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
      <div className="w-3 h-3 rounded-full bg-primary-fixed-dim"></div>
      <span className="ml-2 font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">Nuuf Teranga Ledger v2.4</span>
      </div>
      <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-bright text-primary font-label-md text-[11px] font-semibold">
      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                        En direct • Dakar
                      </span>
      </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">Encaissé ce mois</span>
      <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1 block">2 450 000</span>
      <span className="font-label-currency-unit text-label-currency-unit text-secondary">FCFA (92%)</span>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">En attente</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 block">210 000</span>
      <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">FCFA (1 lot)</span>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">Lots actifs</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 block">8 / 8</span>
      <span className="font-label-currency-unit text-label-currency-unit text-primary">100% occupés</span>
      </div>
      </div>
      
      <div className="p-4 rounded-xl bg-surface-bright">
      <div className="flex items-center justify-between mb-2">
      <span className="font-label-md text-label-md font-semibold text-on-surface">Rythme d'encaissement mensuel</span>
      <span className="font-label-md text-label-md text-primary font-bold">+18% vs mois précédent</span>
      </div>
      
      <svg className="w-full h-14" fill="none" viewBox="0 0 320 60">
      <path className="text-primary-container" d="M0 48 C 40 46, 80 32, 120 30 C 160 28, 200 15, 240 12 C 280 9, 300 4, 320 3" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
      <path className="text-primary-fixed/30" d="M0 48 C 40 46, 80 32, 120 30 C 160 28, 200 15, 240 12 C 280 9, 300 4, 320 3 L 320 60 L 0 60 Z" fill="currentColor"></path>
      <circle className="fill-primary" cx="240" cy="12" r="4" stroke="white" strokeWidth="2"></circle>
      </svg>
      </div>
      
      <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant px-1">
      <span>Derniers règlements vérifiés</span>
      <span>Canal</span>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">villa</span>
      </div>
      <div>
      <h2 className="font-label-lg text-label-lg text-on-surface leading-tight">Villa Ngor • Apt 3B</h2>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Mme Diallo • 04 Mars 09:14</span>
      </div>
      </div>
      <div className="text-right">
      <span className="font-label-lg text-label-lg text-primary font-bold block">450 000 FCFA</span>
      <span className="inline-flex items-center gap-1 font-label-md text-[10px] text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Wave Direct
                        </span>
      </div>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">apartment</span>
      </div>
      <div>
      <h2 className="font-label-lg text-label-lg text-on-surface leading-tight">Mermoz Pyrotechnie • 2E</h2>
      <span className="font-body-sm text-body-sm text-on-surface-variant">M. Fall • 03 Mars 16:42</span>
      </div>
      </div>
      <div className="text-right">
      <span className="font-label-lg text-label-lg text-primary font-bold block">320 000 FCFA</span>
      <span className="inline-flex items-center gap-1 font-label-md text-[10px] text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Orange Money
                        </span>
      </div>
      </div>
      </div>
      </div>
      
      <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-[260px]">
      <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
      <span className="material-symbols-outlined text-[22px]">payments</span>
      </div>
      <div>
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">Wave & Orange Money</span>
      <span className="font-body-sm text-[11px] text-on-surface-variant">Zéro frais d'intermédiation</span>
      </div>
      </div>
      <div className="absolute -top-6 -right-2 sm:-right-6 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-[270px]">
      <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm">
      <span className="material-symbols-outlined text-[22px]">mark_chat_read</span>
      </div>
      <div>
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">Quittance WhatsApp</span>
      <span className="font-body-sm text-[11px] text-on-surface-variant">PDF certifié avec QR Code</span>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full bg-primary text-on-primary py-12 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-on-primary/10">
      
      <div className="flex flex-col items-start pt-4 md:pt-0 md:px-4">
      <span className="font-display-currency text-display-currency text-tertiary-fixed leading-none">-78%</span>
      <span className="font-label-lg text-label-lg font-bold mt-2">de retards de loyer</span>
      <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Des relances respectueuses automatisées avant le 5 du mois.</p>
      </div>
      
      <div className="flex flex-col items-start pt-4 md:pt-0 md:px-4">
      <span className="font-display-currency text-display-currency text-tertiary-fixed leading-none">4 jours</span>
      <span className="font-label-lg text-label-lg font-bold mt-2">gagnés par mois</span>
      <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Fini les trajets Dakar-Thiès et la collecte d'espèces en mains propres.</p>
      </div>
      
      <div className="flex flex-col items-start pt-4 md:pt-0 md:px-4">
      <span className="font-display-currency text-display-currency text-tertiary-fixed leading-none">100%</span>
      <span className="font-label-lg text-label-lg font-bold mt-2">des loyers tracés</span>
      <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Grand livre conforme au COCC et quittances horodatées.</p>
      </div>
      
      <div className="flex flex-col items-start pt-4 md:pt-0 md:px-4">
      <span className="font-display-currency text-display-currency text-secondary-fixed-dim leading-none">+1 200</span>
      <span className="font-label-lg text-label-lg font-bold mt-2">logements actifs</span>
      <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Gérés sur Nuuf à Dakar, Thiès, Saly et Diamniadio.</p>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-20 bg-surface-container-low" id="comment-ca-marche">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">Processus limpide</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Comment ça marche ?</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">La gestion de vos loyers simplifiée en 3 étapes directes, sans friction ni jargon bancaire.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-container text-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                    1
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Ajoutez vos biens</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Renseignez votre appartement aux Almadies, villa à Mbour ou studio à Ouakam. Définissez le montant du loyer en FCFA et le numéro WhatsApp de votre locataire.
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-primary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">add_home</span>
      <span>Prêt en 90 secondes</span>
      </div>
      </div>
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-md text-headline-md font-bold">
                    2
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Paiement direct WhatsApp</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Votre locataire reçoit une alerte amicale et clique sur un lien sécurisé. Il valide en 1 clic son paiement par <strong className="text-on-surface">Wave</strong> ou <strong className="text-on-surface">Orange Money</strong>, sans application à télécharger.
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-secondary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">touch_app</span>
      <span>0 friction pour le locataire</span>
      </div>
      </div>
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                    3
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Suivi & Quittance en temps réel</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    L'argent atterrit sur votre compte. Nuuf expédie instantanément la quittance certifiée conforme en format PDF directement sur le WhatsApp du locataire.
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-primary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">verified_user</span>
      <span>Validation comptable instantanée</span>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-20 bg-background" id="fonctionnalites">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">Conçu pour le terrain sénégalais</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Une suite complète pensée pour les bailleurs</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">Plus qu'un fichier Excel : un copilote financier automatisé qui protège vos revenus locatifs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">currency_exchange</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Encaissement Wave & Orange Money</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Connectez vos flux Mobile Money favoris. Les fonds sont déposés sur votre compte sans attente ni manipulation manuelle d'espèces.
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">receipt_long</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Quittances certifiées automatiques</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Dès l'encaissement validé, une quittance juridique officielle au format PDF dotée d'un code d'authentification est expédiée sur WhatsApp.
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">notifications_active</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Relances douces & automatiques</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Rappels personnalisés programmés dès le 1er du mois puis à l'échéance du 5. Présentez une image rigoureuse et préservez vos relations de voisinage.
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">monitoring</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Tableau de bord financier clair</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Visualisez instantanément vos taux de recouvrement, identifiez les impayés résiduels et exportez votre grand livre comptable vers Excel en un clic.
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">gavel</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Conformité légale COCC & BCEAO</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Baux types et documents locatifs alignés sur le Code des Obligations Civiles et Commerciales du Sénégal, garantissant une solidité juridique maximale.
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">domain_add</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Multi-biens & Multi-villes</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Gérez aussi facilement un studio unique au Point E ou un complexe immobilier de 30 appartements répartis entre Mermoz, Thiès et la Petite Côte.
                </p>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-16 bg-surface-container-low">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-6 space-y-6">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold">
      <span className="material-symbols-outlined text-[16px]">verified</span>
                  Sérénité Garantie
                </span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                  Fini les litiges de fin de mois et les « je vous ai déjà envoyé l'argent »
                </h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Chaque paiement Mobile Money est réconcilié automatiquement avec l'identifiant de transaction unique de l'opérateur. La quittance scellée protège le locataire tout autant que le bailleur.
                </p>
      <div className="grid grid-cols-2 gap-4 pt-2">
      <div className="p-4 rounded-xl bg-surface-container-low">
      <span className="font-headline-sm text-headline-sm font-bold text-primary block">0 litige</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">grâce aux preuves numérisées</span>
      </div>
      <div className="p-4 rounded-xl bg-surface-container-low">
      <span className="font-headline-sm text-headline-sm font-bold text-primary block">24h / 24</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">accès aux baux et quittances</span>
      </div>
      </div>
      </div>
      <div className="lg:col-span-6 relative">
      <img className="w-full h-80 md:h-96 rounded-2xl object-cover shadow-md" alt="Modern upscale residential building in Dakar Senegal Almadies neighborhood with lush tropical palms and minimalist architectural balconies under bright warm sunlight, reflecting real estate prosperity and order." src="/img/photo-6.jpg" />
      <div className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-4 rounded-xl shadow-lg border-none flex items-center gap-3">
      <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
      <div>
      <p className="font-label-lg text-label-lg font-bold text-on-surface">Protégé par Nuuf</p>
      <p className="font-body-sm text-[11px] text-on-surface-variant">Archivage légal pendant 10 ans</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-20 bg-background" id="temoignages">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">Retours d'expérience</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Approuvé par les bailleurs à Dakar & Thiès</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">Découvrez comment des propriétaires sénégalais ont éliminé les tracas d'encaissement au quotidien.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
      <div className="space-y-4">
      <div className="flex items-center gap-1 text-secondary">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                    « Depuis que j'utilise Nuuf, je ne cours plus après mes locataires. Le 5 du mois, 100% de mes loyers sont encaissés par Wave directement sur mon compte. »
                  </p>
      </div>
      <div className="flex items-center gap-3 pt-4 bg-surface-container-lowest">
      <img className="w-12 h-12 rounded-full object-cover shadow-sm" alt="Portrait of Amadou Seck, a distinguished smiling Senegalese male landlord in his forties wearing an elegant smart-casual blazer in Dakar, natural daylight." src="/img/photo-5.jpg" />
      <div>
      <div className="flex items-center gap-1.5">
      <span className="font-label-lg text-label-lg font-bold text-on-surface">Amadou Seck</span>
      <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Mermoz & Almadies • 8 appartements</span>
      </div>
      </div>
      </div>
      
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
      <div className="space-y-4">
      <div className="flex items-center gap-1 text-secondary">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                    « Les quittances automatiques sur WhatsApp ont changé ma vie et professionnalisé la relation avec mes locataires. Zéro appel conflictuel. »
                  </p>
      </div>
      <div className="flex items-center gap-3 pt-4 bg-surface-container-lowest">
      <img className="w-12 h-12 rounded-full object-cover shadow-sm" alt="Portrait of Fatou Kine Ndiaye, a successful Senegalese businesswoman and property owner in a modern traditional outfit, confident expression in an office in Dakar." src="/img/photo-1.jpg" />
      <div>
      <div className="flex items-center gap-1.5">
      <span className="font-label-lg text-label-lg font-bold text-on-surface">Fatou Kiné Ndiaye</span>
      <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Thiès & Ngor • 4 villas</span>
      </div>
      </div>
      </div>
      
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
      <div className="space-y-4">
      <div className="flex items-center gap-1 text-secondary">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                    « Le tableau de bord me donne une visibilité parfaite sur les flux. Le temps gagné chaque mois est tout simplement inestimable pour mon cabinet. »
                  </p>
      </div>
      <div className="flex items-center gap-3 pt-4 bg-surface-container-lowest">
      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-base shadow-sm">
                    CD
                  </div>
      <div>
      <div className="flex items-center gap-1.5">
      <span className="font-label-lg text-label-lg font-bold text-on-surface">Cheikh Tidiane Diop</span>
      <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Ouakam • 15 logements gérés</span>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-20 bg-surface-container-low" id="faq">
      <div className="w-full max-w-4xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">Réponses claires</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Foire Aux Questions</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">Tout ce que vous devez savoir pour démarrer sereinement sur Nuuf.</p>
      </div>
      <div className="space-y-4" id="faq-accordion">
      
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item">
      <button className="faq-toggle w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors" type="button">
      <span>Mes locataires doivent-ils obligatoirement créer un compte Nuuf ?</span>
      <span className="material-symbols-outlined text-primary faq-icon transition-transform">expand_more</span>
      </button>
      <div className="faq-content px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Non, absolument pas. Vos locataires n'ont aucune application à installer ni compte à créer. Ils reçoivent simplement une notification WhatsApp avec un lien sécurisé et peuvent régler instantanément depuis leur propre application Wave ou Orange Money.
                </div>
      </div>
      
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item">
      <button className="faq-toggle w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors" type="button">
      <span>Comment l'argent arrive-t-il sur mon compte ?</span>
      <span className="material-symbols-outlined text-primary faq-icon transition-transform">expand_more</span>
      </button>
      <div className="faq-content hidden px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Les fonds sont transférés instantanément sur votre compte Mobile Money désigné (Wave ou Orange Money) ou directement sur votre compte bancaire (virement UEMOA). Nuuf ne bloque jamais vos fonds : l'argent vous appartient sans intermédiaire de séquestre prolongé.
                </div>
      </div>
      
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item">
      <button className="faq-toggle w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors" type="button">
      <span>La quittance générée a-t-elle une valeur juridique au Sénégal ?</span>
      <span className="material-symbols-outlined text-primary faq-icon transition-transform">expand_more</span>
      </button>
      <div className="faq-content hidden px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Oui. Nos quittances respectent scrupuleusement les exigences du Code des Obligations Civiles et Commerciales (COCC) du Sénégal. Elles comportent l'horodatage officiel, l'identifiant de transaction financière, la ventilation du loyer et des charges, ainsi qu'un QR code de vérification infalsifiable.
                </div>
      </div>
      
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item">
      <button className="faq-toggle w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors" type="button">
      <span>Combien coûte le service après les 30 jours d'essai ?</span>
      <span className="material-symbols-outlined text-primary faq-icon transition-transform">expand_more</span>
      </button>
      <div className="faq-content hidden px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Nuuf applique une tarification transparente et fixe par logement géré (à partir de 2 500 FCFA / lot / mois), sans aucun pourcentage prélevé sur le montant de vos loyers. Vous conservez 100% de vos gains.
                </div>
      </div>
      
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item">
      <button className="faq-toggle w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors" type="button">
      <span>Que se passe-t-il si un locataire paie en espèces ?</span>
      <span className="material-symbols-outlined text-primary faq-icon transition-transform">expand_more</span>
      </button>
      <div className="faq-content hidden px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Aucun problème ! Vous pouvez consigner un paiement reçu en espèces en un clic depuis votre espace. Nuuf génère immédiatement la quittance correspondante avec la mention « Règlement en espèces » et l'expédie sur WhatsApp au locataire pour tenir votre comptabilité à jour.
                </div>
      </div>
      </div>
      </div>
      </section>
      
      <section className="w-full py-20 bg-primary text-on-primary relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <path d="M0,0 L100,100 M20,0 L100,80 M0,20 L80,100 M-20,0 L100,120" fill="none" stroke="currentColor" strokeWidth="0.75"></path>
      </svg>
      </div>
      <div className="w-full max-w-5xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop text-center relative z-10 space-y-8">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-tertiary-fixed font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">lock_open</span>
      <span>Accès complet sans engagement</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg md:text-[46px] md:leading-tight font-extrabold tracking-tight">
              Prêt à encaisser vos loyers sans courir ?
            </h2>
      <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl mx-auto leading-relaxed">
              Rejoignez plus de 500 bailleurs sénégalais qui automatisent leur gestion locative dès aujourd'hui. Vos 30 premiers jours sont totalement gratuits.
            </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
      <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:bg-secondary-fixed-dim transition-all shadow-lg group" data-path="inscription" href="#">
      <span>Commencer gratuitement (30 jours offerts)</span>
      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
      </a>
      <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-surface-tint transition-colors" data-path="contact-commercial" href="#">
      <span className="material-symbols-outlined text-[20px]">chat</span>
      <span>Parler à un conseiller</span>
      </a>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-on-primary-container font-body-sm text-body-sm pt-4">
      <span>✓ Sans engagement</span>
      <span>•</span>
      <span>✓ Annulation en 1 clic</span>
      <span>•</span>
      <span>✓ Assistance WhatsApp 7j/7</span>
      </div>
      </div>
      </section>
      
      <footer className="w-full bg-surface-container-highest text-on-surface py-16">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
      
      <div className="lg:col-span-4 space-y-4">
      <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[22px]">apartment</span>
      </div>
      <div className="flex flex-col">
      <span className="font-headline-md text-headline-md lowercase font-bold text-primary leading-none">nuuf</span>
      <span className="font-label-md text-[10px] uppercase tracking-widest text-secondary mt-0.5">Fintech Immobilière • Sénégal</span>
      </div>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pr-6">
                  La sérénité locative au Sénégal. Automatisation de l'encaissement des loyers, quittances juridiques instantanées et conciliation bancaire.
                </p>
      <div className="inline-flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
      <span>Fait avec fierté à Dakar 🇸🇳</span>
      </div>
      </div>
      
      <div className="lg:col-span-2 space-y-3">
      <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Produit</h4>
      <ul className="space-y-2 text-on-surface-variant font-body-md text-body-md">
      <li><a className="hover:text-primary transition-colors" data-path="fonctionnalites" href="#">Fonctionnalités</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="paiements-locatifs" href="#">Wave & OM</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="tarifs" href="#">Tarifs transparents</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="securite" href="#">Sécurité BCEAO</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="telecharger" href="#">Application mobile</a></li>
      </ul>
      </div>
      
      <div className="lg:col-span-3 space-y-3">
      <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Légal & Sécurité</h4>
      <ul className="space-y-2 text-on-surface-variant font-body-md text-body-md">
      <li><a className="hover:text-primary transition-colors" data-path="conditions" href="#">Conditions Générales (CGU)</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="confidentialite" href="#">Protection des Données (CDP)</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="cocc" href="#">Conformité COCC Sénégal</a></li>
      <li><a className="hover:text-primary transition-colors" data-path="mentions" href="#">Mentions Légales</a></li>
      </ul>
      </div>
      
      <div className="lg:col-span-3 space-y-3">
      <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Contact direct</h4>
      <div className="space-y-2.5 font-body-md text-body-md text-on-surface-variant">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-[18px]">call</span>
      <a className="hover:text-primary transition-colors" href="https://wa.me/221770000000" rel="noopener" target="_blank">WhatsApp (+221) 77 000 00 00</a>
      </div>
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
      <a className="hover:text-primary transition-colors" href="mailto:contact@nuuf.sn">contact@nuuf.sn</a>
      </div>
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
      <span>Almadies, Route des Almadies, Dakar</span>
      </div>
      </div>
      </div>
      </div>
      
      <div className="pt-8 border-t border-on-surface/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
      <div>
                © 2026 Nuuf Technologies S.A.S. Tous droits réservés.
              </div>
      <div className="flex items-center gap-4 text-primary">
      <a aria-label="LinkedIn" className="hover:text-primary-container transition-colors" href="#"><span className="font-bold">LinkedIn</span></a>
      <span>•</span>
      <a aria-label="Twitter X" className="hover:text-primary-container transition-colors" href="#"><span className="font-bold">Twitter/X</span></a>
      <span>•</span>
      <a aria-label="Instagram" className="hover:text-primary-container transition-colors" href="#"><span className="font-bold">Instagram</span></a>
      <span>•</span>
      <a aria-label="Facebook" className="hover:text-primary-container transition-colors" href="#"><span className="font-bold">Facebook</span></a>
      </div>
      </div>
      </div>
      </footer>
      </div>
      </main><footer className="w-full bg-surface-container-low text-on-surface-variant"><div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl"><div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-space-xl mb-space-xl"><div className="lg:col-span-2 space-y-space-md"><div className="flex items-center gap-space-sm"><div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-container text-on-primary-container"><span className="material-symbols-outlined text-[20px]">apartment</span></div><span className="font-headline-md text-headline-md lowercase text-primary font-bold tracking-tight">nuuf</span></div><p className="font-body-md text-body-md text-on-surface-variant max-w-sm">La plateforme de gestion locative de référence au Sénégal. Conçue pour les propriétaires et gestionnaires à Dakar, Thiès, Saly et Mbour.</p><div className="flex items-center gap-space-sm text-secondary"><span className="material-symbols-outlined text-[20px]">verified</span><span className="font-label-md text-label-md font-semibold text-on-surface">Conforme aux standards juridiques OHADA</span></div></div><div className="space-y-space-sm"><h3 className="font-label-lg text-label-lg text-on-surface">Produit</h3><ul className="space-y-space-xs"><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="fonctionnalites" href="#">Encaissement de loyers</a></li><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="paiements-locatifs" href="#">Intégration Wave & OM</a></li><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="fonctionnalites" href="#">Quittances automatiques</a></li><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="tarifs" href="#">Grille tarifaire</a></li></ul></div><div className="space-y-space-sm"><h3 className="font-label-lg text-label-lg text-on-surface">Territoires</h3><ul className="space-y-space-xs"><li className="font-body-md text-body-md text-on-surface-variant">Dakar (Almadies, Plateau, Point E)</li><li className="font-body-md text-body-md text-on-surface-variant">Diamniadio & Rufisque</li><li className="font-body-md text-body-md text-on-surface-variant">Thiès & Mbour</li><li className="font-body-md text-body-md text-on-surface-variant">Petite Côte & Saly</li></ul></div><div className="space-y-space-sm"><h3 className="font-label-lg text-label-lg text-on-surface">Légal & Contact</h3><ul className="space-y-space-xs"><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="mentions-legales" href="#">Mentions Légales</a></li><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="confidentialite" href="#">Protection des données</a></li><li role="none"><a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="contact-commercial" href="#">Support WhatsApp (+221)</a></li></ul></div></div><div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><p className="font-body-sm text-body-sm">© 2025 Nuuf Technologies SARL. Tous droits réservés.</p><p className="font-body-sm text-body-sm flex items-center gap-space-xs"><span className="material-symbols-outlined text-[16px] text-primary">lock</span>Paiements sécurisés via Mobile Money & Virement UEMOA</p></div></div></footer>
    </>
  );
}
