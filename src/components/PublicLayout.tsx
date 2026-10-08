import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";
import Preferences from "@/components/Preferences";

const WA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP; // ex. 221771234567
const MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const lienContact = WA ? `https://wa.me/${WA.replace(/\D/g, "")}` : "/#contact";

const NAV = [
  { href: "/", label: N_("Accueil") },
  { href: "/#fonctionnalites", label: N_("Fonctionnalités") },
  { href: "/#comment-ca-marche", label: N_("Comment ça marche") },
  { href: "/tarifs", label: N_("Tarifs") },
  { href: "/#faq", label: "FAQ" },
];

export async function PublicHeader({ actif }: { actif: "accueil" | "tarifs" }) {
  const { t } = await getT();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between">
        <Link href="/" className="flex items-center gap-space-sm group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-[24px]">apartment</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md tracking-tight text-primary leading-none lowercase">nuuf</span>
            <span className="font-label-md text-[10px] text-secondary leading-none uppercase tracking-widest mt-1">Sénégal</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-space-md lg:gap-space-lg">
          {NAV.map((n) => {
            const on = (actif === "accueil" && n.href === "/") || (actif === "tarifs" && n.href === "/tarifs");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  on
                    ? "px-space-sm py-space-xs transition-colors bg-primary-container text-on-primary-container font-label-lg rounded-xl"
                    : "font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors"
                }
              >
                {t(n.label)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-space-sm md:gap-space-md">
          <Preferences />
          <Link href="/connexion" className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-primary hover:text-primary-container px-space-md py-space-sm transition-colors">
            {t("Se connecter")}
          </Link>
          <Link href="/inscription" className="inline-flex items-center justify-center h-12 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm">
            {t("Essai gratuit")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export async function PublicFooter() {
  const { t } = await getT();
  return (
    <footer id="contact" className="w-full bg-surface-container-low">
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined text-[22px]">apartment</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-primary lowercase">nuuf</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("La gestion locative simplifiée au Sénégal : encaissement des loyers par Wave et Orange Money, quittances et relances automatiques.")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">{t("Produit")}</h4>
          <Link href="/#fonctionnalites" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">{t("Fonctionnalités")}</Link>
          <Link href="/tarifs" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">{t("Tarifs")}</Link>
          <Link href="/connexion" className="font-body-md text-body-md text-on-surface-variant hover:text-primary">{t("Se connecter")}</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">{t("Contact")}</h4>
          {WA && (
            <a href={lienContact} target="_blank" rel="noopener" className="font-body-md text-body-md text-on-surface-variant hover:text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
            </a>
          )}
          {MAIL && (
            <a href={`mailto:${MAIL}`} className="font-body-md text-body-md text-on-surface-variant hover:text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">mail</span> {MAIL}
            </a>
          )}
          {!WA && !MAIL && <span className="font-body-md text-body-md text-on-surface-variant">{t("Écrivez-nous depuis votre espace une fois connecté.")}</span>}
        </div>
      </div>
      <div className="border-t border-outline-variant/40 py-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex flex-wrap justify-center gap-x-space-md gap-y-1">
          <span>{t("© Nuuf. Tous droits réservés.")}</span>
          <Link href="/legal/cgu" className="hover:text-primary">{t("Conditions d'utilisation")}</Link>
          <Link href="/legal/confidentialite" className="hover:text-primary">{t("Confidentialité")}</Link>
          <Link href="/legal/mentions-legales" className="hover:text-primary">{t("Mentions légales")}</Link>
        </div>
      </div>
    </footer>
  );
}
