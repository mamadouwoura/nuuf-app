// Porté depuis ajouter_un_bien_et_un_locataire_nuuf/code.html (généré par scripts/port.mjs)
export const bodyClass = "bg-surface font-body-md text-body-md text-on-surface";

export default function AjouterBien() {
  return (
    <>
      <div className="flex flex-col w-full">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md mb-space-lg">
      <div>
      <a className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors mb-space-xs font-label-md text-label-md" href="#">
      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Retour à Mes biens
            </a>
      <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Ajouter un bien &amp; son locataire</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">Configurez le logement, les informations du locataire et les conditions du bail en quelques clics.</p>
      </div>
      <div className="flex items-center gap-space-sm self-start md:self-auto">
      <button className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-all shadow-sm" type="button">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">save</span>
              Enregistrer en brouillon
            </button>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant font-label-md text-label-md">
      <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Brouillon auto-sauvegardé
            </span>
      </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
      
      <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low transition-all">
      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-lg text-label-lg shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[20px]">check</span>
      </div>
      <div className="min-w-0">
      <span className="font-label-md text-label-md text-primary font-semibold block uppercase tracking-wider">Étape 1</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate block">Le bien</span>
      </div>
      </div>
      
      <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low transition-all">
      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-lg text-label-lg shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[20px]">check</span>
      </div>
      <div className="min-w-0">
      <span className="font-label-md text-label-md text-primary font-semibold block uppercase tracking-wider">Étape 2</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate block">Le locataire</span>
      </div>
      </div>
      
      <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low transition-all">
      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-lg text-label-lg shadow-sm shrink-0">
      <span className="material-symbols-outlined text-[20px]">check</span>
      </div>
      <div className="min-w-0">
      <span className="font-label-md text-label-md text-primary font-semibold block uppercase tracking-wider">Étape 3</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate block">Le bail &amp; finances</span>
      </div>
      </div>
      
      <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-primary text-on-primary shadow-md transition-all">
      <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0">
                4
              </div>
      <div className="min-w-0">
      <span className="font-label-md text-label-md text-primary-fixed font-semibold block uppercase tracking-wider">Étape 4 (Active)</span>
      <span className="font-headline-sm text-headline-sm text-on-primary font-bold truncate block">Confirmation</span>
      </div>
      </div>
      </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      
      <div className="lg:col-span-7 flex flex-col gap-space-lg">
      
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
      <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-variant/40">
      <div className="flex items-center gap-space-sm">
      <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">apartment</span>
      </span>
      <div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">1. Le bien immobilier</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Caractéristiques cadastrales et techniques du local</p>
      </div>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> Rempli
                </span>
      </div>
      <div className="space-y-space-md">
      
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Type de bien</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm text-center" type="button">
      <span className="material-symbols-outlined text-[22px] mb-1">domain</span>
                      Appartement
                    </button>
      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors" type="button">
      <span className="material-symbols-outlined text-[22px] mb-1">villa</span>
                      Villa
                    </button>
      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors" type="button">
      <span className="material-symbols-outlined text-[22px] mb-1">single_bed</span>
                      Studio
                    </button>
      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors" type="button">
      <span className="material-symbols-outlined text-[22px] mb-1">storefront</span>
                      Commercial
                    </button>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">Définit le gabarit légal du contrat de location généré automatiquement.</p>
      </div>
      
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Désignation du bien</label>
      <input className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" type="text" defaultValue="Appartement F3 Standing - Ngor Almadies (B4)" />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Précisez l'étage et le numéro de porte pour faciliter l'identification sur les quittances.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Quartier &amp; Ville</label>
      <div className="relative">
      <select className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr-10 cursor-pointer">
      <option selected>Almadies, Dakar</option>
      <option>Ngor, Dakar</option>
      <option>Ouakam, Dakar</option>
      <option>Mermoz / Sacré-Cœur</option>
      <option>Point E / Fann</option>
      <option>Dakar-Plateau</option>
      <option>Saly / Mbour</option>
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Utilisé pour l'enregistrement fiscal et le barème indicatif.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Superficie habitable (m²)</label>
      <div className="relative">
      <input className="w-full h-11 pl-space-md pr-12 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="number" defaultValue="115" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-label-md text-on-surface-variant font-bold">m²</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Surface utile mentionnée dans les annexes descriptives.</p>
      </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Compteur Woyofal Senelec n°</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">bolt</span>
      <input className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="0428 9912 401" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Le numéro Woyofal sera joint aux notifications mensuelles du locataire.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Sous-compteur SEN'EAU</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">water_drop</span>
      <input className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="EAU-ALM-B4-202" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Index initial relevé lors de l'état des lieux d'entrée.</p>
      </div>
      </div>
      </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
      <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-variant/40">
      <div className="flex items-center gap-space-sm">
      <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">person</span>
      </span>
      <div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">2. Le locataire</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Coordonnées personnelles et contact WhatsApp de facturation</p>
      </div>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> Rempli
                </span>
      </div>
      <div className="space-y-space-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Nom et Prénom</label>
      <input className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="Aminata Diallo" />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Nom complet tel qu'inscrit sur la pièce d'identité officielle.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Téléphone mobile &amp; WhatsApp</label>
      <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center px-3 h-11 rounded-xl bg-surface-container font-label-md text-label-md text-on-surface font-bold">
                        🇸🇳 +221
                      </span>
      <input className="flex-1 h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none font-semibold" type="tel" defaultValue="77 645 89 20" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Indispensable pour l'envoi automatique des quittances et des liens Wave / OM.</p>
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Numéro CNI / Passeport</label>
      <input className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="1 752 1993 02847" />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sera servent à générer ses quittances et à lui envoyer son lien de paiement.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Courriel électronique <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(Optionnel)</span></label>
      <input className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="email" defaultValue="aminata.diallo@sonatel.sn" />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Une copie PDF de la quittance y sera transmise chaque mois.</p>
      </div>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Profession &amp; Employeur</label>
      <input className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="Ingénieure Réseau chez Sonatel Orange" />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Garantie d'employabilité enregistrée au dossier de solvabilité Nuuf.</p>
      </div>
      </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
      <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-variant/40">
      <div className="flex items-center gap-space-sm">
      <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-[20px]">payments</span>
      </span>
      <div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">3. Le bail &amp; conditions financières</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Loyer, échéancier de paiement et modalités de versement</p>
      </div>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> Rempli
                </span>
      </div>
      <div className="space-y-space-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Loyer mensuel charges comprises</label>
      <div className="relative">
      <input className="w-full h-11 pl-space-md pr-16 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm font-bold focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="250 000" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-currency-unit text-label-currency-unit text-primary font-bold">FCFA</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Le montant net facturé chaque mois sans frais supplémentaires pour le locataire.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Dépôt de garantie / Caution</label>
      <div className="relative">
      <input className="w-full h-11 pl-space-md pr-16 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm font-bold focus:ring-2 focus:ring-primary-container outline-none" type="text" defaultValue="500 000" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-currency-unit text-label-currency-unit text-primary font-bold">FCFA</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Équivalent à 2 mois de loyer séquestré garanti en cas de dégradation ou préavis.</p>
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Date de prise d'effet (Entrée)</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
      <input className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="date" defaultValue="2026-11-01" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Date d'ouverture officielle du bail et remise des clés.</p>
      </div>
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Jour d'exigibilité mensuelle</label>
      <div className="relative">
      <select className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr-10 cursor-pointer">
      <option selected>Le 05 de chaque mois</option>
      <option>Le 01 de chaque mois</option>
      <option>Le 10 de chaque mois</option>
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Les rappels bienveillants partiront automatiquement 3 jours avant cette date.</p>
      </div>
      </div>
      
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Canaux d'encaissement activés</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-primary-fixed/20 text-on-surface">
      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">Wave Sénégal</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Lien direct 1-clic</span>
      </div>
      </div>
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-primary-fixed/20 text-on-surface">
      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">Orange Money</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">QR &amp; push USSD</span>
      </div>
      </div>
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-surface-container text-on-surface">
      <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">Virement Bancaire</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">IBAN / BOA / CBAO</span>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      
      <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
      
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xl relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-space-md">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm">
      <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                  Prêt à être activé
                </span>
      <span className="font-label-md text-label-md text-on-surface-variant">Bail N° DK-2026-088</span>
      </div>
      
      <div className="rounded-xl overflow-hidden mb-space-md relative">
      <img className="w-full h-44 object-cover" data-alt="A modern, luxurious interior living room in a Dakar Almadies apartment with large windows revealing palm trees, contemporary African art, polished terrazzo floors, and warm natural sunlight highlighting pristine green accents." src="/img/photo-7.jpg" />
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-md">
      <div>
      <span className="font-label-md text-label-md text-secondary-container font-semibold uppercase tracking-wide">Almadies, Dakar</span>
      <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">Appartement F3 Standing - Ngor Almadies</h3>
      </div>
      </div>
      </div>
      
      <div className="space-y-space-sm mb-space-lg">
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
                      AD
                    </div>
      <div>
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">Aminata Diallo</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">+221 77 645 89 20</span>
      </div>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-bold">
      <span className="material-symbols-outlined text-[14px]">verified</span> WhatsApp lié
                  </span>
      </div>
      
      <div className="grid grid-cols-2 gap-space-sm">
      <div className="p-3 rounded-xl bg-surface-container">
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Loyer mensuel</span>
      <span className="font-headline-sm text-headline-sm text-primary font-extrabold block">250 000 <span className="font-label-currency-unit text-label-currency-unit">FCFA</span></span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Charges incluses</span>
      </div>
      <div className="p-3 rounded-xl bg-surface-container">
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Caution garantie</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold block">500 000 <span className="font-label-currency-unit text-label-currency-unit">FCFA</span></span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">2 mois de loyer</span>
      </div>
      </div>
      
      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5 text-body-sm font-body-sm">
      <div className="flex justify-between items-center text-on-surface">
      <span className="text-on-surface-variant">Prise d'effet du bail :</span>
      <span className="font-semibold">01 Novembre 2026</span>
      </div>
      <div className="flex justify-between items-center text-on-surface">
      <span className="text-on-surface-variant">Échéance mensuelle :</span>
      <span className="font-semibold">Chaque 05 du mois</span>
      </div>
      <div className="flex justify-between items-center text-on-surface">
      <span className="text-on-surface-variant">Contrat type :</span>
      <span className="font-semibold">Bail d'habitation 1 an renouvelable</span>
      </div>
      </div>
      </div>
      
      <div className="p-space-md rounded-xl bg-primary-fixed/20 text-on-surface mb-space-lg flex items-start gap-3">
      <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">bolt</span>
      <div>
      <h4 className="font-label-lg text-label-lg font-bold text-primary">Automatisation instantanée Nuuf</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Dès validation, un lien sécurisé Wave &amp; Orange Money ainsi que l'accès au portail locataire seront envoyés par WhatsApp et SMS à Aminata Diallo.
                  </p>
      </div>
      </div>
      
      <div className="flex flex-col gap-space-sm">
      <button className="w-full h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer" type="button">
      <span>Envoyer le 1<sup>er</sup> lien de paiement</span>
      <span className="material-symbols-outlined text-[20px]">send</span>
      </button>
      <button className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-all" type="button">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">description</span>
                  Télécharger le contrat de bail pré-rempli (PDF)
                </button>
      </div>
      </div>
      
      <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md shadow-sm">
      <span className="material-symbols-outlined text-secondary text-[28px]">verified_user</span>
      <div className="text-body-sm font-body-sm text-on-surface-variant">
      <span className="font-bold text-on-surface">Quittances vérifiables</span>. Chaque quittance émise sur Nuuf est numérotée, horodatée et contrôlable par QR code.
              </div>
      </div>
      </div>
      </div>
      </div>
    </>
  );
}
