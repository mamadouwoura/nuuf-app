"use client";

import Link from "next/link";
import { useState } from "react";
import { creerBienEtLocataire } from "@/app/actions/biens";
import { useT } from "@/lib/i18n/client";
import { formaterDate } from "@/lib/i18n/format";


export default function AjouterBienForm({ erreur }: { erreur?: string }) {
  const { t, locale } = useT();
  const [designation, setDesignation] = useState("");
  const [quartier, setQuartier] = useState("Almadies, Dakar");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [loyer, setLoyer] = useState("");
  const [caution, setCaution] = useState("");
  const [debut, setDebut] = useState("");
  const [jour, setJour] = useState("5");
  const chiffres = (v: string) => Number(v.replace(/\D/g, "")) || 0;
  const fmt = (v: string) => (chiffres(v) ? String(chiffres(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "—");
  const fait1 = designation.trim().length >= 3;
  const fait2 = nom.trim().length >= 3 && tel.replace(/\D/g, "").length >= 9;
  const fait3 = chiffres(loyer) > 0 && Boolean(debut);
  const etapeActive = !fait1 ? 1 : !fait2 ? 2 : !fait3 ? 3 : 4;
  const initiales = nom.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const moisCaution = chiffres(loyer) && chiffres(caution) ? Math.round((chiffres(caution) / chiffres(loyer)) * 10) / 10 : null;
  const dateFr = debut ? formaterDate(new Date(debut), locale, { day: "2-digit", month: "long", year: "numeric" }) : "—";
  return (
    <form action={creerBienEtLocataire}>
      {erreur && (
        <p role="alert" className="mb-space-md rounded-xl bg-error-container text-on-error-container px-space-md py-2 font-body-md text-body-md">
          {erreur}
        </p>
      )}
      <div className="flex flex-col w-full">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md mb-space-lg">
      <div>
      <Link className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors mb-space-xs font-label-md text-label-md" href="/biens">
      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {t("Retour à Mes biens")}
            </Link>
      <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{t("Ajouter un bien & son locataire")}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Configurez le logement, les informations du locataire et les conditions du bail en quelques clics.")}</p>
      </div>
      <div className="flex items-center gap-space-sm self-start md:self-auto">
      
      </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
      {([[t("Le bien"), fait1], [t("Le locataire"), fait2], [t("Le bail & finances"), fait3], [t("Confirmation"), false]] as [string, boolean][]).map(([titre, fait], i) => {
        const actif = etapeActive === i + 1;
        return (
          <div key={titre} aria-current={actif ? "step" : undefined} className={`flex items-center gap-space-sm p-space-sm rounded-xl transition-all ${actif ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-low"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-label-lg text-label-lg shrink-0 ${fait ? "bg-primary-container text-on-primary shadow-sm" : actif ? "bg-primary-fixed text-on-primary-fixed font-bold" : "bg-surface-container-high text-on-surface-variant"}`}>
              {fait ? <span className="material-symbols-outlined text-[20px]">check</span> : i + 1}
            </div>
            <div className="min-w-0">
              <span className={`font-label-md text-label-md font-semibold block uppercase tracking-wider ${actif ? "text-primary-fixed" : "text-primary"}`}>{t("Étape {n}", { n: i + 1 })}{actif ? ` • ${t("en cours")}` : ""}</span>
              <span className={`font-headline-sm text-headline-sm font-bold truncate block ${actif ? "text-on-primary" : "text-on-surface"}`}>{titre}</span>
            </div>
          </div>
        );
      })}
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
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("1. Le bien immobilier")}</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Caractéristiques cadastrales et techniques du local")}</p>
      </div>
      </div>
      {fait1 && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> {t("Rempli")}
                </span>)}
      </div>
      <div className="space-y-space-md">
      
      <div>
      <label htmlFor="champ-type" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Type de bien")}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
      <label className="cursor-pointer"><input id="champ-type" type="radio" name="type" value="APPARTEMENT" className="peer sr-only" defaultChecked /><span className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm"><span className="material-symbols-outlined text-[22px] mb-1">domain</span>{t("Appartement")}</span></label>
      <label className="cursor-pointer"><input type="radio" name="type" value="VILLA" className="peer sr-only" /><span className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm"><span className="material-symbols-outlined text-[22px] mb-1">villa</span>{t("Villa")}</span></label>
      <label className="cursor-pointer"><input type="radio" name="type" value="STUDIO" className="peer sr-only" /><span className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm"><span className="material-symbols-outlined text-[22px] mb-1">single_bed</span>{t("Studio")}</span></label>
      <label className="cursor-pointer"><input type="radio" name="type" value="COMMERCIAL" className="peer sr-only" /><span className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-sm"><span className="material-symbols-outlined text-[22px] mb-1">storefront</span>{t("Commercial")}</span></label>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{t("Permet de classer vos logements et d'afficher la bonne icône.")}</p>
      </div>
      
      <div>
      <label htmlFor="champ-designation" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Désignation du bien")}</label>
      <input id="champ-designation" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" type="text" name="designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder={t("Appartement F3 - Ouakam, 2e étage")} />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Précisez l'étage et le numéro de porte pour faciliter l'identification sur les quittances.")}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-quartier" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Quartier & Ville")}</label>
      <div className="relative">
      <select id="champ-quartier" name="quartier" aria-label={t("Quartier")} value={quartier} onChange={(e) => setQuartier(e.target.value)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr-10 cursor-pointer">
      <option>{t("Almadies, Dakar")}</option>
      <option>{t("Ngor, Dakar")}</option>
      <option>{t("Ouakam, Dakar")}</option>
      <option>{t("Mermoz / Sacré-Cœur")}</option>
      <option>{t("Point E / Fann")}</option>
      <option>{t("Dakar-Plateau")}</option>
      <option>{t("Saly / Mbour")}</option>
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Quartier et ville du logement (visible dans vos listes).")}</p>
      </div>
      <div>
      <label htmlFor="champ-surfaceM2" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Superficie habitable (m²)")}</label>
      <div className="relative">
      <input id="champ-surfaceM2" className="w-full h-11 pl-space-md pr-12 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="number" name="surfaceM2" placeholder="85" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-label-md text-on-surface-variant font-bold">m²</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Facultatif : surface habitable du logement.")}</p>
      </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-compteurElec" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Compteur Woyofal Senelec n°")}</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">bolt</span>
      <input id="champ-compteurElec" className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" name="compteurElec" aria-label={t("Numéro du compteur d'électricité")} />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Facultatif : numéro du compteur d'électricité, pour mémoire.")}</p>
      </div>
      <div>
      <label htmlFor="champ-compteurEau" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Sous-compteur SEN'EAU")}</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">water_drop</span>
      <input id="champ-compteurEau" className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" name="compteurEau" aria-label={t("Numéro du compteur d'eau")} />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Facultatif : référence du compteur d'eau, pour mémoire.")}</p>
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
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("2. Le locataire")}</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Coordonnées personnelles et contact WhatsApp de facturation")}</p>
      </div>
      </div>
      {fait2 && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> {t("Rempli")}
                </span>)}
      </div>
      <div className="space-y-space-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-locNom" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Nom et Prénom")}</label>
      <input id="champ-locNom" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" name="locNom" required value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t("Prénom et nom")} />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Nom complet tel qu'inscrit sur la pièce d'identité officielle.")}</p>
      </div>
      <div>
      <label htmlFor="champ-locTel" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Téléphone mobile & WhatsApp")}</label>
      <div className="flex items-center gap-2">
      <span className="shrink-0 inline-flex items-center justify-center px-3 h-11 rounded-xl bg-surface-container font-label-md text-label-md text-on-surface font-bold">
                        🇸🇳 +221
                      </span>
      <input id="champ-locTel" className="flex-1 min-w-0 w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none font-semibold" type="tel" name="locTel" required value={tel} onChange={(e) => setTel(e.target.value)} placeholder="77 000 00 00" />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Indispensable pour l'envoi automatique des quittances et des liens Wave / OM.")}</p>
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-locCni" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Numéro CNI / Passeport")}</label>
      <input id="champ-locCni" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" name="locCni" aria-label={t("Numéro de pièce d'identité du locataire")} />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Sera servent à générer ses quittances et à lui envoyer son lien de paiement.")}</p>
      </div>
      <div>
      <label htmlFor="champ-locEmail" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Courriel électronique")} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">{t("(Optionnel)")}</span></label>
      <input id="champ-locEmail" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="email" name="locEmail" aria-label={t("E-mail du locataire")} />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Une copie PDF de la quittance y sera transmise chaque mois.")}</p>
      </div>
      </div>
      <div>
      <label htmlFor="champ-locProfession" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Profession & Employeur")}</label>
      <input id="champ-locProfession" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="text" name="locProfession" aria-label={t("Profession du locataire")} />
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Garantie d'employabilité enregistrée au dossier de solvabilité Nuuf.")}</p>
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
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("3. Le bail & conditions financières")}</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Loyer, échéancier de paiement et modalités de versement")}</p>
      </div>
      </div>
      {fait3 && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-md text-label-md font-semibold">
      <span className="material-symbols-outlined text-[14px]">check_circle</span> {t("Rempli")}
                </span>)}
      </div>
      <div className="space-y-space-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-loyer" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Loyer mensuel charges comprises")}</label>
      <div className="relative">
      <input id="champ-loyer" className="w-full h-11 pl-space-md pr-16 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm font-bold focus:ring-2 focus:ring-primary-container outline-none" type="text" name="loyer" required inputMode="numeric" value={loyer} onChange={(e) => setLoyer(e.target.value)} placeholder="250 000" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-currency-unit text-label-currency-unit text-primary font-bold">FCFA</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Le montant net facturé chaque mois sans frais supplémentaires pour le locataire.")}</p>
      </div>
      <div>
      <label htmlFor="champ-caution" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Dépôt de garantie / Caution")}</label>
      <div className="relative">
      <input id="champ-caution" className="w-full h-11 pl-space-md pr-16 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm font-bold focus:ring-2 focus:ring-primary-container outline-none" type="text" name="caution" inputMode="numeric" value={caution} onChange={(e) => setCaution(e.target.value)} placeholder="500 000" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-currency-unit text-label-currency-unit text-primary font-bold">FCFA</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Montant de la caution versée par le locataire (pour mémoire).")}</p>
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <div>
      <label htmlFor="champ-debut" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Date de prise d'effet (Entrée)")}</label>
      <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
      <input id="champ-debut" className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none" type="date" name="debut" aria-label={t("Date de prise d'effet")} required value={debut} onChange={(e) => setDebut(e.target.value)} />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Date d'ouverture officielle du bail et remise des clés.")}</p>
      </div>
      <div>
      <label htmlFor="champ-jour" className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Jour d'exigibilité mensuelle")}</label>
      <div className="relative">
      <select id="champ-jour" name="jour" aria-label={t("Jour d'échéance du loyer")} value={jour} onChange={(e) => setJour(e.target.value)} className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none appearance-none pr-10 cursor-pointer">
      <option value="5">{t("Le 05 de chaque mois")}</option>
      <option value="1">{t("Le 01 de chaque mois")}</option>
      <option value="10">{t("Le 10 de chaque mois")}</option>
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Le loyer est exigible à cette date chaque mois ; un retard apparaît alors dans « Relances ».")}</p>
      </div>
      </div>
      
      <div>
      <label className="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">{t("Moyens d'encaissement")}</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-primary-fixed/20 text-on-surface">
      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">Wave Sénégal</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Lien direct 1-clic")}</span>
      </div>
      </div>
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-primary-fixed/20 text-on-surface">
      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">Orange Money</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Lien de paiement 1-clic")}</span>
      </div>
      </div>
      <div className="flex items-center gap-space-sm p-3 rounded-xl bg-surface-container text-on-surface">
      <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
      <div className="flex flex-col">
      <span className="font-label-md text-label-md font-bold">{t("Espèces")}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Saisie manuelle + quittance")}</span>
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
      <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>{fait1 && fait2 && fait3 ? t("Prêt à être enregistré") : t("À compléter")}</span>
      <span className="font-label-md text-label-md text-on-surface-variant">{t("Nouveau bail")}</span>
      </div>
      
      <div className="rounded-xl overflow-hidden mb-space-md relative">
      <div className="w-full h-44 bg-gradient-to-br from-primary-container to-primary" aria-hidden="true"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-md">
      <div>
      <span className="font-label-md text-label-md text-secondary-container font-semibold uppercase tracking-wide">{quartier}</span>
      <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">{designation || t("Nouveau bien")}</h3>
      </div>
      </div>
      </div>
      
      <div className="space-y-space-sm mb-space-lg">
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
                      {initiales}
                    </div>
      <div>
      <span className="font-label-lg text-label-lg font-bold text-on-surface block">{nom || t("Locataire")}</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">+221 {tel}</span>
      </div>
      </div>
      
      </div>
      
      <div className="grid grid-cols-2 gap-space-sm">
      <div className="p-3 rounded-xl bg-surface-container">
      <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("Loyer mensuel")}</span>
      <span className="font-headline-sm text-headline-sm text-primary font-extrabold block">{fmt(loyer)} <span className="font-label-currency-unit text-label-currency-unit">FCFA</span></span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{t("Charges incluses")}</span>
      </div>
      <div className="p-3 rounded-xl bg-surface-container">
      <span className="font-body-sm text-body-sm text-on-surface-variant block">{t("Caution garantie")}</span>
      <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold block">{fmt(caution)} <span className="font-label-currency-unit text-label-currency-unit">FCFA</span></span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{moisCaution ? t("{n} mois de loyer", { n: moisCaution }) : "—"}</span>
      </div>
      </div>
      
      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5 text-body-sm font-body-sm">
      <div className="flex justify-between items-center text-on-surface">
      <span className="text-on-surface-variant">{t("Prise d'effet du bail :")}</span>
      <span className="font-semibold">{dateFr}</span>
      </div>
      <div className="flex justify-between items-center text-on-surface">
      <span className="text-on-surface-variant">{t("Échéance mensuelle :")}</span>
      <span className="font-semibold">{t("Chaque {jour} du mois", { jour: jour.padStart(2, "0") })}</span>
      </div>
      
      </div>
      </div>
      
      <div className="p-space-md rounded-xl bg-primary-fixed/20 text-on-surface mb-space-lg flex items-start gap-3">
      <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">bolt</span>
      <div>
      <h4 className="font-label-lg text-label-lg font-bold text-primary">{t("Et ensuite ?")}</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {t("Le premier loyer sera créé. Depuis la fiche du bien, vous pourrez envoyer à {nom} son lien de paiement Wave / Orange Money par WhatsApp, ou encaisser en espèces.", { nom: nom || t("votre locataire") })}
                  </p>
      </div>
      </div>
      
      <div className="flex flex-col gap-space-sm">
      <button className="w-full h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer" type="submit">
      <span>{t("Enregistrer le bien et le locataire")}</span>
      <span className="material-symbols-outlined text-[20px]">send</span>
      </button>
      
      </div>
      </div>
      
      <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md shadow-sm">
      <span className="material-symbols-outlined text-secondary text-[28px]">verified_user</span>
      <div className="text-body-sm font-body-sm text-on-surface-variant">
      <span className="font-bold text-on-surface">{t("Quittances vérifiables")}</span>{t(". Chaque quittance émise sur Nuuf est numérotée, horodatée et contrôlable par QR code.")}
              </div>
      </div>
      </div>
      </div>
      </div>
    </form>
  );
}
