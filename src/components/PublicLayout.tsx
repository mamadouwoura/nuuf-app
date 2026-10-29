import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import LangueSwitch from "@/components/LangueSwitch";
import MenuMobile from "@/components/MenuMobile";
import NavPublique from "@/components/NavPublique";
import ThemeToggle from "@/components/ThemeToggle";

const WA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP; // ex. 221771234567
const MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const lienContact = WA ? `https://wa.me/${WA.replace(/\D/g, "")}` : "/#demo";

/**
 * Barre du haut du site public : logo, pastille de navigation centrée (verre dépoli) et deux boutons.
 * `actif` : « accueil » (les liens défilent sur la page), « tarifs » (page Tarifs) ou « autre » (pages légales, etc.).
 */
export async function PublicHeader({ actif }: { actif: "accueil" | "tarifs" | "autre" }) {
  const { t } = await getT();
  const base = actif === "accueil" ? "" : "/";
  const liens = [
    { id: "comment-ca-marche", href: `${base}#comment-ca-marche`, label: t("Comment ça marche") },
    { id: "tester", href: `${base}#tester`, label: t("Tester") },
    { id: "tarifs", href: actif === "tarifs" ? "/tarifs" : `${base}#tarifs`, label: t("Tarifs") },
    { id: "faq", href: `${base}#faq`, label: "FAQ" },
    { id: "demo", href: `${base}#demo`, label: t("Démo") },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 lg:px-6">
        <Link href="/" className="text-[1.6rem] font-extrabold tracking-tight text-primary" aria-label="Nuuf">
          nuuf<span className="text-secondary-container">.</span>
        </Link>
        <div className="hidden rounded-full bg-surface-container-low px-2 py-1.5 ring-1 ring-outline-variant/50 xl:block">
          <NavPublique liens={liens} actifInitial={actif === "tarifs" ? "tarifs" : ""} suivreDefilement={actif === "accueil"} />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LangueSwitch /></div>
          <div className="hidden md:block"><ThemeToggle /></div>
          <Link href="/connexion" className="hidden h-11 items-center rounded-full bg-surface-container-lowest px-5 font-label-lg text-label-lg font-semibold text-on-surface ring-1 ring-outline-variant/60 sm:inline-flex">
            {t("Se connecter")}
          </Link>
          <Link href={`${base}#demo`} className="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full bg-[#082d23] px-4 font-label-lg text-label-lg font-bold text-white transition-transform active:scale-[0.98] sm:px-5">
            {t("Voir une démo")}
          </Link>
          <MenuMobile liens={liens.map(({ href, label }) => ({ href, label }))} />
        </div>
      </div>
    </header>
  );
}

/** Pied de page : marque, navigation, contact et mentions légales, dans un grand bloc arrondi. */
export async function PublicFooter() {
  const { t } = await getT();
  const lien = "font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors";
  const titre = "mb-3 font-label-md text-label-md font-bold uppercase tracking-[0.18em] text-on-surface";
  return (
    <footer id="contact" className="mx-2 mb-2 rounded-[2rem] bg-surface-container-low px-6 py-12 ring-1 ring-outline-variant/50 lg:mx-3 lg:px-14">
      <div className="mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-[1.4fr_1fr_1fr_1fr] md:text-left">
        <div>
          <p className="text-[1.75rem] font-extrabold tracking-tight text-primary">nuuf<span className="text-secondary-container">.</span></p>
          <p className="mx-auto mt-3 max-w-xs font-body-md text-body-md text-on-surface-variant md:mx-0">
            {t("La gestion locative simplifiée au Sénégal : encaissement des loyers par Wave et Orange Money, quittances et relances automatiques.")}
          </p>
        </div>
        <nav aria-label={t("Navigation")} className="flex flex-col items-center gap-2 md:items-start">
          <h4 className={titre}>{t("Navigation")}</h4>
          <Link href="/#comment-ca-marche" className={lien}>{t("Comment ça marche")}</Link>
          <Link href="/tarifs" className={lien}>{t("Tarifs")}</Link>
          <Link href="/#demo" className={lien}>{t("Démo")}</Link>
          <Link href="/connexion" className={lien}>{t("Se connecter")}</Link>
        </nav>
        <div className="flex flex-col items-center gap-2 md:items-start">
          <h4 className={titre}>{t("Contact")}</h4>
          {WA && (
            <a href={lienContact} target="_blank" rel="noopener" className={`${lien} flex items-center gap-2`}>
              <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
            </a>
          )}
          {MAIL && (
            <a href={`mailto:${MAIL}`} className={`${lien} flex items-center gap-2`}>
              <span className="material-symbols-outlined text-[18px]">mail</span> {MAIL}
            </a>
          )}
          {!WA && !MAIL && <span className={lien}>{t("Écrivez-nous depuis votre espace une fois connecté.")}</span>}
        </div>
        <nav aria-label={t("Informations légales")} className="flex flex-col items-center gap-2 md:items-start">
          <h4 className={titre}>{t("Légal")}</h4>
          <Link href="/legal/cgu" className={lien}>{t("Conditions d'utilisation")}</Link>
          <Link href="/legal/confidentialite" className={lien}>{t("Confidentialité")}</Link>
          <Link href="/legal/mentions-legales" className={lien}>{t("Mentions légales")}</Link>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-outline-variant/50 pt-6 text-center font-body-sm text-body-sm text-on-surface-variant md:text-left">
        <p>{t("Nuuf est un outil de gestion : il ne détient jamais vos fonds. Les résultats dépendent de votre activité et de vos locataires.")}</p>
        <p className="mt-2">{t("© Nuuf. Tous droits réservés.")}</p>
      </div>
    </footer>
  );
}
