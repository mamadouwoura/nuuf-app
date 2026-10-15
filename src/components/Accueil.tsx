import DemoMobile from "@/components/DemoMobile";
import { lienContact } from "@/components/PublicLayout";
import { getT } from "@/lib/i18n/server";


export default async function Accueil() {
  const { t } = await getT();
  return (
    <>
      <main className="w-full pt-20 bg-background min-h-screen"><div className="flex flex-col w-full">
      
      <section className="relative w-full overflow-hidden bg-background pt-8 pb-20 lg:pt-14 lg:pb-28">
      
      <div className="pointer-events-none absolute -top-40 right-0 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-primary-fixed/40 via-surface-tint/10 to-transparent blur-3xl -z-10"></div>
      <div className="pointer-events-none absolute top-1/2 -left-36 w-[480px] h-[480px] rounded-full bg-secondary-fixed/30 blur-3xl -z-10"></div>
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      
      <div className="lg:col-span-6 flex flex-col items-start space-y-6">
      
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high shadow-sm">
      <span className="text-base leading-none">🇸🇳</span>
      <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                    {t("La gestion locative pensée pour les bailleurs du Sénégal")}
                  </span>
      </div>
      
      <h1 className="font-headline-lg text-headline-lg md:text-[52px] md:leading-[1.1] tracking-tight text-on-surface font-extrabold">
                  {t("Vos loyers,")} <span className="text-primary italic font-serif tracking-normal">{t("sans courir.")}</span>
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  {t("Nuuf encaisse vos loyers par")} <strong className="text-on-surface font-semibold">Wave</strong> {t("et")} <strong className="text-on-surface font-semibold">Orange Money</strong>{t(", génère automatiquement vos quittances numérotées avec QR code et facilite vos relances avec tact.")}
                </p>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
      <a className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-md group" href="/inscription">
      <span>{t("Essayer gratuitement 14 jours")}</span>
      <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
      </a>
      
      </div>
      
      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-on-surface-variant font-body-sm text-body-sm pt-2">
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
      <span>{t("Sans carte bancaire")}</span>
      </div>
      <span className="hidden sm:inline text-outline-variant">•</span>
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">event_available</span>
      <span>{t("14 jours d'essai")}</span>
      </div>
      <span className="hidden sm:inline text-outline-variant">•</span>
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
      <span>{t("Configuration en 3 minutes")}</span>
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
      <span className="ml-2 font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">{t("Aperçu du tableau de bord")}</span>
      </div>
      <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-bright text-primary font-label-md text-[11px] font-semibold">
      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                        {t("Exemple")}
                      </span>
      </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">{t("Encaissé ce mois")}</span>
      <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1 block">2 450 000</span>
      <span className="font-label-currency-unit text-label-currency-unit text-secondary">{t("FCFA (92%)")}</span>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">{t("En attente")}</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 block">210 000</span>
      <span className="font-label-currency-unit text-label-currency-unit text-on-surface-variant">{t("FCFA (1 lot)")}</span>
      </div>
      <div className="p-3.5 rounded-xl bg-surface-container-low">
      <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant block">{t("Lots actifs")}</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 block">8 / 8</span>
      <span className="font-label-currency-unit text-label-currency-unit text-primary">{t("100% occupés")}</span>
      </div>
      </div>
      
      <div className="p-4 rounded-xl bg-surface-bright">
      <div className="flex items-center justify-between mb-2">
      <span className="font-label-md text-label-md font-semibold text-on-surface">{t("Rythme d'encaissement mensuel")}</span>
      <span className="font-label-md text-label-md text-primary font-bold">{t("+18% vs mois précédent")}</span>
      </div>
      
      <svg className="w-full h-14" fill="none" viewBox="0 0 320 60">
      <path className="text-primary-container" d="M0 48 C 40 46, 80 32, 120 30 C 160 28, 200 15, 240 12 C 280 9, 300 4, 320 3" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
      <path className="text-primary-fixed/30" d="M0 48 C 40 46, 80 32, 120 30 C 160 28, 200 15, 240 12 C 280 9, 300 4, 320 3 L 320 60 L 0 60 Z" fill="currentColor"></path>
      <circle className="fill-primary" cx="240" cy="12" r="4" stroke="white" strokeWidth="2"></circle>
      </svg>
      </div>
      
      <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant px-1">
      <span>{t("Derniers règlements vérifiés")}</span>
      <span>{t("Canal")}</span>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">villa</span>
      </div>
      <div>
      <h2 className="font-label-lg text-label-lg text-on-surface leading-tight">{t("Villa Ngor • Apt 3B")}</h2>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Mme Diallo • 04 Mars 09:14")}</span>
      </div>
      </div>
      <div className="text-right">
      <span className="font-label-lg text-label-lg text-primary font-bold block">{t("450 000 FCFA")}</span>
      <span className="inline-flex items-center gap-1 font-label-md text-[10px] text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {t("Wave Direct")}
                        </span>
      </div>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">apartment</span>
      </div>
      <div>
      <h2 className="font-label-lg text-label-lg text-on-surface leading-tight">{t("Mermoz Pyrotechnie • 2E")}</h2>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("M. Fall • 03 Mars 16:42")}</span>
      </div>
      </div>
      <div className="text-right">
      <span className="font-label-lg text-label-lg text-primary font-bold block">{t("320 000 FCFA")}</span>
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
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">{t("Wave & Orange Money")}</span>
      <span className="font-body-sm text-[11px] text-on-surface-variant">{t("Zéro frais d'intermédiation")}</span>
      </div>
      </div>
      <div className="absolute -top-6 -right-2 sm:-right-6 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-[270px]">
      <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm">
      <span className="material-symbols-outlined text-[22px]">mark_chat_read</span>
      </div>
      <div>
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">{t("Quittance WhatsApp")}</span>
      <span className="font-body-sm text-[11px] text-on-surface-variant">{t("PDF numéroté avec QR code")}</span>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      
      
      <section className="w-full py-20 bg-surface-container-low" id="comment-ca-marche">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">{t("Processus limpide")}</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{t("Comment ça marche ?")}</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">{t("La gestion de vos loyers simplifiée en 3 étapes directes, sans friction ni jargon bancaire.")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-container text-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                    1
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t("Ajoutez vos biens")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {t("Renseignez votre appartement aux Almadies, villa à Mbour ou studio à Ouakam. Définissez le montant du loyer en FCFA et le numéro WhatsApp de votre locataire.")}
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-primary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">add_home</span>
      <span>{t("Prêt en 90 secondes")}</span>
      </div>
      </div>
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-md text-headline-md font-bold">
                    2
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t("Paiement direct WhatsApp")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {t("Votre locataire reçoit un lien sécurisé par WhatsApp et clique dessus. Il valide en 1 clic son paiement par")} <strong className="text-on-surface">Wave</strong> {t("ou")} <strong className="text-on-surface">Orange Money</strong>{t(", sans application à télécharger.")}
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-secondary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">touch_app</span>
      <span>{t("0 friction pour le locataire")}</span>
      </div>
      </div>
      
      <div className="relative bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                    3
                  </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t("Suivi & Quittance en temps réel")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {t("L'argent atterrit sur votre compte. Nuuf génère aussitôt la quittance PDF numérotée, que vous pouvez envoyer au locataire sur WhatsApp en un clic.")}
                  </p>
      </div>
      <div className="mt-6 pt-4 flex items-center gap-2 text-primary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">verified_user</span>
      <span>{t("Suivi comptable instantané")}</span>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      <DemoMobile />
      
      <section className="w-full py-20 bg-background" id="fonctionnalites">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">{t("Conçu pour le terrain sénégalais")}</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{t("Une suite complète pensée pour les bailleurs")}</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">{t("Plus qu'un fichier Excel : un copilote financier automatisé qui protège vos revenus locatifs.")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">currency_exchange</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Encaissement Wave & Orange Money")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Vos locataires paient en un clic par Wave ou Orange Money depuis un lien WhatsApp. Les loyers sont encaissés sur votre propre compte.")}
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">receipt_long</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Quittances automatiques")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Dès l'encaissement validé, une quittance PDF numérotée avec un QR code d'authentification est générée. Vous pouvez l'envoyer par WhatsApp en un clic.")}
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">notifications_active</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Relances douces & automatiques")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Relancez en un clic les loyers en retard par WhatsApp, avec le lien de paiement. Les rappels automatiques seront activés dès la connexion de WhatsApp Business.")}
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">monitoring</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Tableau de bord financier clair")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Visualisez instantanément vos taux de recouvrement, vos loyers en retard et vos encaissements par mois et par canal.")}
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">gavel</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Quittances vérifiables")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Chaque quittance est numérotée, horodatée et vérifiable par QR code : le locataire comme le bailleur peuvent en contrôler l'authenticité.")}
                </p>
      </div>
      
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[26px]">domain_add</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">{t("Multi-biens & Multi-villes")}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Gérez aussi facilement un studio unique qu'un parc de dizaines de logements répartis entre plusieurs quartiers et villes.")}
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
                  {t("Sérénité Garantie")}
                </span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                  {t("Fini les litiges de fin de mois et les « je vous ai déjà envoyé l'argent »")}
                </h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {t("Chaque paiement Mobile Money est réconcilié automatiquement avec l'identifiant de transaction unique de l'opérateur. La quittance scellée protège le locataire tout autant que le bailleur.")}
                </p>
      <div className="grid grid-cols-2 gap-4 pt-2">
      <div className="p-4 rounded-xl bg-surface-container-low">
      <span className="font-headline-sm text-headline-sm font-bold text-primary block">{t("Preuve")}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("chaque paiement est horodaté et tracé")}</span>
      </div>
      <div className="p-4 rounded-xl bg-surface-container-low">
      <span className="font-headline-sm text-headline-sm font-bold text-primary block">7j / 7</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("accès à vos quittances et à l'historique")}</span>
      </div>
      </div>
      </div>
      <div className="lg:col-span-6 relative">
      <div className="w-full h-full min-h-64 bg-gradient-to-br from-primary-container to-primary rounded-2xl" />
      <div className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-4 rounded-xl shadow-lg border-none flex items-center gap-3">
      <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
      <div>
      <p className="font-label-lg text-label-lg font-bold text-on-surface">{t("Protégé par Nuuf")}</p>
      <p className="font-body-sm text-[11px] text-on-surface-variant">{t("Quittances conservées et téléchargeables à tout moment")}</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      
      
      
      <section className="w-full py-20 bg-surface-container-low" id="faq">
      <div className="w-full max-w-4xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="text-center mb-16 space-y-3">
      <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">{t("Réponses claires")}</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{t("Foire Aux Questions")}</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant">{t("Tout ce que vous devez savoir pour démarrer sereinement sur Nuuf.")}</p>
      </div>
      <div className="space-y-4" id="faq-accordion">
      
      <details className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item group"><summary className="w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer list-none">
      <span>{t("Mes locataires doivent-ils obligatoirement créer un compte Nuuf ?")}</span>
      <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
      </summary><div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Non, absolument pas. Vos locataires n'ont aucune application à installer ni compte à créer. Ils reçoivent simplement une notification WhatsApp avec un lien sécurisé et peuvent régler instantanément depuis leur propre application Wave ou Orange Money.")}
                </div></details>
      
      <details className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item group"><summary className="w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer list-none">
      <span>{t("Comment l'argent arrive-t-il sur mon compte ?")}</span>
      <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
      </summary><div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">{t("Les loyers sont réglés directement sur votre compte Wave ou Orange Money : Nuuf ne détient jamais vos fonds. Nuuf rapproche automatiquement chaque paiement et émet la quittance.")}</div></details>
      
      <details className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item group"><summary className="w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer list-none">
      <span>{t("La quittance générée a-t-elle une valeur juridique au Sénégal ?")}</span>
      <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
      </summary><div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">{t("Chaque quittance est numérotée, horodatée, mentionne les parties, la période et le montant, et porte un QR code qui permet d'en vérifier l'authenticité en ligne. Pour un besoin juridique précis, rapprochez-vous de votre conseil.")}</div></details>
      
      <details className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item group"><summary className="w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer list-none">
      <span>{t("Combien coûte le service après les 14 jours d'essai ?")}</span>
      <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
      </summary><div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">{t("Bailleur : 10 000 FCFA/mois (jusqu'à 15 logements). Pro : 25 000 FCFA/mois (jusqu'à 50 logements, 5 accès équipe). Agence : 15 000 FCFA/mois jusqu'à 20 logements, 25 000 FCFA/mois jusqu'à 50, puis 300 FCFA par logement supplémentaire. Aucun pourcentage n'est prélevé sur vos loyers.")}</div></details>
      
      <details className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all faq-item group"><summary className="w-full text-left p-6 flex items-center justify-between gap-4 font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer list-none">
      <span>{t("Que se passe-t-il si un locataire paie en espèces ?")}</span>
      <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
      </summary><div className="px-6 pb-6 pt-0 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {t("Aucun problème ! Vous pouvez consigner un paiement reçu en espèces en un clic depuis votre espace. Nuuf génère immédiatement la quittance correspondante avec la mention « Règlement en espèces » que vous pouvez envoyer au locataire par WhatsApp.")}
                </div></details>
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
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md">
      <span className="material-symbols-outlined text-[18px]">lock_open</span>
      <span>{t("Accès complet sans engagement")}</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg md:text-[46px] md:leading-tight font-extrabold tracking-tight">
              {t("Prêt à encaisser vos loyers sans courir ?")}
            </h2>
      <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl mx-auto leading-relaxed">
              {t("Automatisez dès aujourd'hui l'encaissement de vos loyers et vos quittances. Vos 14 premiers jours sont totalement gratuits, sans carte bancaire.")}
            </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
      <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:bg-secondary-fixed-dim transition-all shadow-lg group" href="/inscription">
      <span>{t("Commencer gratuitement (14 jours offerts)")}</span>
      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
      </a>
      <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-surface-tint transition-colors" href={lienContact} target="_blank">
      <span className="material-symbols-outlined text-[20px]">chat</span>
      <span>{t("Parler à un conseiller")}</span>
      </a>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-on-primary-container font-body-sm text-body-sm pt-4">
      <span>{t("✓ Sans engagement")}</span>
      <span>•</span>
      <span>{t("✓ Annulation en 1 clic")}</span>
      <span>•</span>
      <span>{t("✓ Assistance WhatsApp 7j/7")}</span>
      </div>
      </div>
      </section>
      
      
      </div>
      </main>
    </>
  );
}
