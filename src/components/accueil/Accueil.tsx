import Link from "next/link";
import type { CSSProperties } from "react";
import DemoFormulaire from "@/components/accueil/DemoFormulaire";
import RecitDefilement from "@/components/accueil/RecitDefilement";
import Reveal from "@/components/accueil/Reveal";
import TestGratuit from "@/components/accueil/TestGratuit";
import TarifsAccueil from "@/components/TarifsAccueil";
import VideoPresentation from "@/components/VideoPresentation";
import { prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { fcfa } from "@/lib/immo";
import { getT } from "@/lib/i18n/server";
import { PLANS } from "@/lib/plans-publics";

const WA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
const MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
type T = Awaited<ReturnType<typeof getT>>["t"];

const eyebrow = "font-label-md text-label-md font-bold uppercase tracking-[0.18em] text-primary";
const titre = "font-extrabold tracking-[-0.035em] leading-[1.04] text-on-surface text-[clamp(2.1rem,5.2vw,3.9rem)]";
const bouton = "inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 font-label-lg text-label-lg font-bold transition-transform active:scale-[0.98]";
const w = (ch: string) => ({ "--w": ch }) as CSSProperties;

/* ------------------------------ Hero ------------------------------ */
async function Hero({ t }: { t: T }) {
  const alertes = [
    [t("Loyer reçu"), "Awa Diallo · Almadies · 250 000 FCFA", 2],
    [t("Quittance envoyée"), "Q-2026-10-042 · Villa Mbour", 5],
    [t("Retard à relancer"), "Fatou Sow · Ouakam · 13 j", 8],
    [t("Loyer reçu"), "Cheikh Ba · Mermoz · 300 000 FCFA", 11],
    [t("Bilan prêt"), "Ousmane M. · octobre", 14],
    [t("Paiement partiel"), "Moussa Ndiaye · 120 000 / 250 000", 17],
    [t("Relance envoyée"), "Ibrahima Fall · WhatsApp", 21],
    [t("Nouveau locataire"), "Studio C1 · Ngor", 25],
  ] as const;
  const piste = [...alertes, ...alertes];
  return (
    <section id="accueil" className="nf-hero relative mx-2 overflow-hidden rounded-[2rem] pb-10 pt-24 text-white sm:pt-32 lg:mx-3">
      <div className="nf-blob nf-blob-a" aria-hidden="true" />
      <div className="nf-blob nf-blob-b" aria-hidden="true" />
      <svg className="pointer-events-none absolute -top-24 right-[-10%] hidden w-[60%] opacity-30 sm:block" viewBox="0 0 600 300" fill="none" aria-hidden="true">
        <circle cx="420" cy="40" r="260" stroke="white" strokeWidth="1" />
        <circle cx="500" cy="10" r="170" stroke="white" strokeWidth="1" />
        <circle cx="330" cy="150" r="9" stroke="white" strokeWidth="1.5" />
      </svg>
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
        <p className="text-[1.75rem] font-extrabold tracking-tight">nuuf<span className="text-secondary-container">.</span></p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-label-md text-label-md text-white/90 ring-1 ring-white/20 backdrop-blur">
          <span className="size-1.5 rounded-full bg-[#aaf1d8]" aria-hidden="true" />
          {t("La gestion locative, en automatique")}
        </p>
        <h1 className="mt-6 font-extrabold leading-[1] tracking-[-0.03em] text-[clamp(2.4rem,7.4vw,5.6rem)]">
          <span className="block">{t("Vos loyers encaissés.")}</span>
          <span className="sr-only">{t("Sans cahier. Sans Excel. Sans relance gênante. Sans quittance à la main.")}</span>
          <span className="nf-lignes nf-lignes-masque mt-2 block whitespace-nowrap pb-2 text-[clamp(1.55rem,5.2vw,4.1rem)] text-[#aaf1d8]" aria-hidden="true">
            <span>{t("Sans cahier.")}</span>
            <span>{t("Sans Excel.")}</span>
            <span>{t("Sans relance gênante.")}</span>
            <span>{t("Sans quittance à la main.")}</span>
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-pretty font-body-lg text-body-lg text-white/75">
          {t("Recevez vos loyers par Wave et Orange Money, avec quittances et relances automatiques, sans rien connaître à l'informatique.")}
        </p>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-label-lg text-label-lg text-white/80" aria-label={t("+ de temps, 0 cahier, 0 Excel")}>
          <span>{t("+ de temps")}</span>
          <span>{t("0 cahier")}</span>
          <span>{t("0 Excel")}</span>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/inscription" className={`${bouton} nf-lueur bg-white text-[#082d23]`}>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            {t("Essayer 14 jours")}
          </Link>
          <Link href="#comment-ca-marche" className={`${bouton} bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/15`}>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            {t("Comment ça marche")}
          </Link>
        </div>
      </div>
      <p className="relative z-10 mt-12 text-center font-body-sm text-body-sm text-white/55">{t("Les alertes que reçoivent nos bailleurs au quotidien (exemples)")}</p>
      <div className="nf-marquee-zone relative z-10 mt-4" aria-hidden="true">
        <div className="nf-marquee px-3">
          {piste.map(([titreAlerte, detail, min], i) => (
            <div key={i} className="flex w-[19rem] shrink-0 items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left ring-1 ring-white/15 backdrop-blur">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#aaf1d8]/20 text-[#aaf1d8]">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-label-lg text-label-lg font-semibold">{titreAlerte}</span>
                <span className="block truncate font-body-sm text-body-sm text-white/65">{detail}</span>
              </span>
              <span className="shrink-0 font-body-sm text-[11px] text-white/45">{t("il y a {n} min", { n: min })}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Présentation vidéo ------------------------- */
async function Presentation({ t }: { t: T }) {
  return (
    <section id="presentation" className="mx-auto max-w-7xl px-5 py-24 text-center sm:py-28">
      <Reveal>
        <p className={eyebrow}>{t("La présentation")}</p>
        <h2 className={`${titre} mt-4`}>
          {t("Tout comprendre")}
          <br />
          <span className="text-primary-container">{t("en 30 secondes.")}</span>
        </h2>
      </Reveal>
      <Reveal className="mt-10" delai={80}>
        <VideoPresentation />
      </Reveal>
      <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3" delai={120}>
        <Link href="/inscription" className={`${bouton} bg-[#082d23] text-white`}>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          {t("Essayer 14 jours")}
        </Link>
        <Link href="#tarifs" className={`${bouton} bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant/60`}>{t("Voir le tarif")}</Link>
      </Reveal>
    </section>
  );
}

/* --------------------------- Maquettes animées --------------------------- */
const carte = "w-full max-w-sm rounded-[1.75rem] bg-surface-container-lowest p-5 shadow-xl ring-1 ring-outline-variant/50";

function MaquetteBien({ t }: { t: T }) {
  const ligne = (k: string, v: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3.5 py-2.5">
      <span className="font-body-sm text-body-sm text-on-surface-variant">{k}</span>
      <span className="min-w-0 font-label-lg text-label-lg font-semibold text-on-surface">{v}</span>
    </div>
  );
  return (
    <div className={carte} aria-hidden="true">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-black text-on-primary">n</span>
        <span className="font-label-lg text-label-lg font-bold text-on-surface">{t("Votre espace")}</span>
      </div>
      <div className="flex flex-col gap-2">
        {ligne(t("Le bien"), <><span className="nf-typer" style={w("23ch")}>Appartement F3 · Ouakam</span><span className="nf-caret" /></>)}
        {ligne(t("Loyer"), "150 000 FCFA")}
        {ligne(t("Locataire"), "Awa Diallo")}
        {ligne("WhatsApp", "77 ••• •• ••")}
      </div>
      <div className="nf-lueur mt-4 rounded-full bg-primary-container py-3 text-center font-label-lg text-label-lg font-bold text-on-primary">{t("Ajouter ce bien")}</div>
      <p className="mt-3 text-center font-body-sm text-body-sm text-on-surface-variant">{t("5 biens suivis")}</p>
    </div>
  );
}

function MaquetteLien({ t }: { t: T }) {
  return (
    <div className="flex max-w-md flex-col gap-6" aria-hidden="true">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#082d23] px-4 py-2 text-lg font-extrabold text-white">nuuf<span className="text-secondary-container">.</span></span>
        <div className="nf-trajet flex-1 border-t-2 border-dashed border-primary/40"><span className="nf-point" /></div>
        <span className="grid size-12 place-items-center rounded-2xl bg-[#168a3e] text-white shadow-lg"><span className="material-symbols-outlined">chat</span></span>
      </div>
      <div className="nf-flotte ml-auto max-w-[88%] rounded-3xl rounded-tr-lg bg-[#d9fdd3] px-4 py-3 text-[#0b3d2e] shadow-lg">
        <p className="font-body-md text-body-md">{t("Bonjour Awa, le loyer d'octobre est de 150 000 FCFA. Vous pouvez payer ici :")}</p>
        <p className="mt-2 inline-block rounded-xl bg-white/70 px-3 py-1.5 font-label-md text-label-md font-semibold text-primary">nuuf.sn/payer/F7K2</p>
      </div>
    </div>
  );
}

function MaquettePaiement({ t }: { t: T }) {
  return (
    <div className={`${carte} relative min-h-[17rem]`} aria-hidden="true">
      <div className="nf-couche-1">
        <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Loyer d'octobre")}</p>
        <p className="font-headline-md text-headline-md font-extrabold text-on-surface">150 000 <span className="text-sm font-bold text-on-surface-variant">FCFA</span></p>
        <p className="mb-2 mt-4 font-body-sm text-body-sm text-on-surface-variant">{t("Payer avec")}</p>
        <div className="flex gap-2">
          <span className="nf-anneau flex-1 rounded-2xl bg-[#1dc8ff]/20 py-3 text-center font-label-lg text-label-lg font-bold text-[#066a88]">Wave</span>
          <span className="flex-1 rounded-2xl bg-surface-container-low py-3 text-center font-label-lg text-label-lg font-bold text-on-surface-variant">Orange Money</span>
        </div>
        <div className="nf-lueur mt-5 rounded-full bg-primary-container py-3 text-center font-label-lg text-label-lg font-bold text-on-primary">{t("Payer 150 000 FCFA")}</div>
      </div>
      <div className="nf-couche-2 absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-success-container text-on-success-container">
        <span className="grid size-16 place-items-center rounded-full bg-success text-white"><span className="material-symbols-outlined text-[36px]">check</span></span>
        <p className="font-headline-sm text-headline-sm font-extrabold">{t("Paiement reçu")}</p>
        <p className="font-body-sm text-body-sm">{t("Quittance générée automatiquement")}</p>
      </div>
    </div>
  );
}

function MaquetteAlertes({ t }: { t: T }) {
  const notif = (cl: string, titreN: string, detail: string, quand: string) => (
    <div className={`${cl} rounded-2xl bg-white/90 px-3.5 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur`}>
      <div className="flex items-center justify-between font-body-sm text-[11px] text-on-surface-variant"><span className="font-semibold">nuuf</span><span>{quand}</span></div>
      <p className="font-label-lg text-label-lg font-bold text-on-surface">{titreN}</p>
      <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{detail}</p>
    </div>
  );
  return (
    <div className="w-full max-w-[17rem] rounded-[2.2rem] bg-[#0b1f19] p-2.5 shadow-2xl ring-1 ring-black/40" aria-hidden="true">
      <div className="flex min-h-[26rem] flex-col gap-2.5 rounded-[1.8rem] bg-gradient-to-b from-[#1b6f5a] to-[#0b3d2e] p-3.5 pt-8 text-white">
        <p className="text-center font-body-sm text-body-sm text-white/70">{t("samedi 17 octobre")}</p>
        <p className="text-center text-5xl font-light tracking-tight">9:41</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {notif("nf-n1", t("Loyer reçu"), "Awa Diallo · Ouakam · 150 000 FCFA", t("maintenant"))}
          {notif("nf-n2", t("Quittance envoyée"), "Q-2026-10-042", t("il y a 1 min"))}
          {notif("nf-n3", t("Retard à relancer"), "Fatou Sow · 13 jours", t("il y a 8 min"))}
        </div>
      </div>
    </div>
  );
}

function MaquetteLoyers({ t }: { t: T }) {
  const ligne = (initiales: string, nom: string, bien: string, etat: string, cl: string, vedette = false) => (
    <div className={`${vedette ? "nf-ligne-vedette" : "border border-transparent"} flex items-center gap-3 rounded-2xl bg-surface-container-low px-3 py-2.5`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-container font-label-md text-label-md font-bold text-on-primary">{initiales}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-label-lg text-label-lg font-semibold text-on-surface">{nom}</span>
        <span className="block truncate font-body-sm text-[11px] text-on-surface-variant">{bien}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 font-label-md text-[11px] font-bold ${cl}`}>{etat}</span>
    </div>
  );
  return (
    <div className={carte} aria-hidden="true">
      <p className="mb-3 font-label-lg text-label-lg font-bold text-on-surface">{t("Mes loyers")}</p>
      <div className="flex flex-col gap-2">
        {ligne("AD", "Awa Diallo", "Almadies · A12", t("Payé"), "bg-success-container text-on-success-container")}
        {ligne("MN", "Moussa Ndiaye", "Mbour · Villa 3", t("En attente"), "bg-secondary-fixed text-on-secondary-fixed")}
        {ligne("FS", "Fatou Sow", "Ouakam · Studio", t("En retard"), "bg-error-container text-on-error-container", true)}
      </div>
      <div className="nf-lueur mt-4 flex items-center justify-center gap-2 rounded-full bg-[#168a3e] py-3 font-label-lg text-label-lg font-bold text-white">
        <span className="material-symbols-outlined text-[18px]">chat</span>
        {t("Relancer par WhatsApp")}
      </div>
    </div>
  );
}

/* ------------------------------ Étapes ------------------------------ */
async function Etapes({ t }: { t: T }) {
  const etapes = [
    { n: "01", qui: t("Vous · une seule fois"), titre: t("Vous ajoutez vos biens."), texte: t("Le nom du bien, le loyer en FCFA, le numéro WhatsApp du locataire. Pas besoin de savoir faire un site ou un tableau : c'est prêt en quelques instants."), visuel: <MaquetteBien t={t} /> },
    { n: "02", qui: t("Nuuf · tout seul"), titre: t("Le lien de paiement part par WhatsApp."), texte: t("Chaque mois, Nuuf crée l'échéance et envoie à votre locataire un lien sécurisé. Il n'a aucune application à installer."), visuel: <MaquetteLien t={t} /> },
    { n: "03", qui: t("Votre locataire"), titre: t("Il paie en un clic."), texte: t("Par Wave ou Orange Money, depuis son téléphone. Le paiement est enregistré et rattaché au bon loyer."), visuel: <MaquettePaiement t={t} /> },
    { n: "04", qui: t("Nuuf · tout seul"), titre: t("Vous êtes alerté, la quittance part toute seule."), texte: t("Vous recevez la notification sur votre téléphone. Une quittance PDF numérotée, avec QR code, est générée et prête à être envoyée."), visuel: <MaquetteAlertes t={t} /> },
    { n: "05", qui: t("Vous · un coup d'œil"), titre: t("Tout est rangé au même endroit."), texte: t("Qui a payé, qui est en attente, qui est en retard. Un clic pour relancer par WhatsApp : aucun loyer ne se perd."), visuel: <MaquetteLoyers t={t} /> },
  ];
  return (
    <section id="comment-ca-marche" className="scroll-mt-24">
      <div className="mx-auto max-w-4xl px-5 pt-24 text-center sm:pt-28">
        <Reveal>
          <p className={eyebrow}>{t("Comment ça marche")}</p>
          <h2 className={`${titre} mt-4`}>
            {t("Un logiciel qui suit")}
            <br />
            {t("vos loyers à votre place.")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
            {t("Normalement, il faut un cahier, un tableau, des appels et des quittances écrites à la main. Avec Nuuf, tout cela se fait seul.")}
          </p>
        </Reveal>
      </div>
      <RecitDefilement lignes={[t("Vous ajoutez vos biens,"), t("votre locataire paie,")]} final={t("votre téléphone sonne.")} />
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-5 pb-24 sm:gap-28">
        {etapes.map((e, i) => (
          <div key={e.n} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
              <p className="flex items-center gap-3 font-label-lg text-label-lg font-semibold text-primary">
                <span className="grid size-11 place-items-center rounded-full bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant/60">{e.n}</span>
                {e.qui}
              </p>
              <h3 className="mt-5 text-balance font-extrabold leading-[1.06] tracking-[-0.03em] text-on-surface text-[clamp(1.8rem,3.6vw,2.9rem)]">{e.titre}</h3>
              <p className="mt-4 max-w-md text-pretty font-body-lg text-body-lg text-on-surface-variant">{e.texte}</p>
            </Reveal>
            <Reveal delai={90} className={i % 2 === 1 ? "lg:order-1" : ""}>
              <div className="grid min-h-[22rem] place-items-center rounded-[2rem] bg-gradient-to-br from-surface-container-low to-surface-container p-6 ring-1 ring-outline-variant/40 sm:p-10">{e.visuel}</div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------- Résumé, test, tarifs, démo -------------------------- */
async function Resume({ t }: { t: T }) {
  return (
    <section className="nf-sombre relative mx-2 overflow-hidden rounded-[2rem] px-5 py-24 text-center text-white sm:py-28 lg:mx-3">
      <Reveal>
        <p className="font-label-md text-label-md font-bold uppercase tracking-[0.18em] text-[#aaf1d8]">{t("En résumé")}</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-balance font-extrabold leading-[1.04] tracking-[-0.035em] text-[clamp(2.1rem,5.2vw,3.9rem)]">
          {t("Nuuf suit vos loyers.")}
          <br />
          <span className="text-[#aaf1d8]">{t("Vous, vous encaissez.")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty font-body-lg text-body-lg text-white/70">{t("Vous dites ce que vous gérez. Le reste, c'est le logiciel qui le fait.")}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/inscription" className={`${bouton} bg-white text-[#082d23]`}>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            {t("Essayer 14 jours")}
          </Link>
          <Link href="#tarifs" className={`${bouton} bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15`}>{t("Voir le tarif")}</Link>
        </div>
      </Reveal>
    </section>
  );
}

async function Test({ t }: { t: T }) {
  return (
    <section id="tester" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-24 text-center sm:py-28">
      <Reveal>
        <p className={eyebrow}>{t("Test gratuit · 10 secondes")}</p>
        <h2 className={`${titre} mt-4`}>
          {t("Est-ce que ça marche")}
          <br />
          <span className="text-primary-container">{t("pour votre parc ?")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
          {t("Dites-nous combien de logements vous gérez : nous vous indiquons tout de suite le forfait adapté et son prix.")}
        </p>
      </Reveal>
      <Reveal className="mt-10" delai={80}>
        <TestGratuit />
      </Reveal>
    </section>
  );
}

async function Tarifs({ t }: { t: T }) {
  const plans = PLANS.map((p) => ({
    code: p.code,
    nom: t(p.nom),
    pour: t(p.pour),
    logements: t(p.logements),
    vedette: p.vedette,
    points: p.points.map((x) => t(x)),
    prixMensuel: fcfa(prixMensuel(p.code, 0)),
    prixAnnuel: fcfa(prixAnnuel(p.code, 0)),
    note: p.code === "AGENCE" ? t("jusqu'à 20 logements, puis 24 900 FCFA jusqu'à 50") : undefined,
  }));
  return (
    <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 text-center sm:pb-28">
      <Reveal>
        <p className={eyebrow}>{t("Tarif")}</p>
        <h2 className={`${titre} mt-4`}>
          {t("Un prix simple.")}
          <br />
          <span className="text-primary-container">{t("Aucun pourcentage sur vos loyers.")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty font-body-lg text-body-lg text-on-surface-variant">{t("À partir de 9 900 FCFA par mois. 14 jours d'essai gratuit, sans carte bancaire, sans engagement.")}</p>
      </Reveal>
      <Reveal className="mt-12 text-left" delai={80}>
        <TarifsAccueil plans={plans} />
      </Reveal>
    </section>
  );
}

async function Faq({ t }: { t: T }) {
  const questions = [
    [t("Mes locataires doivent-ils obligatoirement créer un compte Nuuf ?"), t("Non, absolument pas. Vos locataires n'ont aucune application à installer ni compte à créer. Ils reçoivent simplement une notification WhatsApp avec un lien sécurisé et peuvent régler instantanément depuis leur propre application Wave ou Orange Money.")],
    [t("Comment l'argent arrive-t-il sur mon compte ?"), t("Les loyers sont réglés directement sur votre compte Wave ou Orange Money : Nuuf ne détient jamais vos fonds. Nuuf rapproche automatiquement chaque paiement et émet la quittance.")],
    [t("La quittance générée a-t-elle une valeur juridique au Sénégal ?"), t("Chaque quittance est numérotée, horodatée, mentionne les parties, la période et le montant, et porte un QR code qui permet d'en vérifier l'authenticité en ligne. Pour un besoin juridique précis, rapprochez-vous de votre conseil.")],
    [t("Combien coûte le service après les 14 jours d'essai ?"), t("Bailleur : 9 900 FCFA/mois (jusqu'à 15 logements). Pro : 24 900 FCFA/mois (jusqu'à 50 logements, 5 accès équipe). Agence : 14 900 FCFA/mois jusqu'à 20 logements, 24 900 FCFA/mois jusqu'à 50, puis 300 FCFA par logement supplémentaire. Aucun pourcentage n'est prélevé sur vos loyers.")],
    [t("Que se passe-t-il si un locataire paie en espèces ?"), t("Aucun problème ! Vous pouvez consigner un paiement reçu en espèces en un clic depuis votre espace. Nuuf génère immédiatement la quittance correspondante avec la mention « Règlement en espèces » que vous pouvez envoyer au locataire par WhatsApp.")],
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 pb-24 sm:pb-28">
      <Reveal className="text-center">
        <p className={eyebrow}>{t("Réponses claires")}</p>
        <h2 className={`${titre} mt-4`}>{t("Foire Aux Questions")}</h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty font-body-lg text-body-lg text-on-surface-variant">{t("Tout ce que vous devez savoir pour démarrer sereinement sur Nuuf.")}</p>
      </Reveal>
      <Reveal className="mt-10 flex flex-col gap-3" delai={80}>
        {questions.map(([q, r]) => (
          <details key={q} className="group rounded-3xl bg-surface-container-lowest ring-1 ring-outline-variant/50 transition-colors open:ring-primary-container/50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left font-headline-sm text-headline-sm font-semibold text-on-surface">
              <span>{q}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-container text-primary transition-transform duration-300 group-open:rotate-45">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </span>
            </summary>
            <p className="px-6 pb-6 font-body-md text-body-md leading-relaxed text-on-surface-variant">{r}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}

async function Demo({ t }: { t: T }) {
  return (
    <section id="demo" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:pb-28">
      <div className="grid gap-10 rounded-[2rem] bg-surface-container-low p-6 ring-1 ring-outline-variant/50 sm:p-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <p className={eyebrow}>{t("Démo avec l'équipe Nuuf")}</p>
          <h2 className="mt-4 text-balance font-extrabold leading-[1.05] tracking-[-0.035em] text-on-surface text-[clamp(1.9rem,4.2vw,3.1rem)]">
            {t("Pas sûr que ça marche pour votre parc ?")}
            <br />
            <span className="text-primary-container">{t("On regarde ensemble. Gratuitement.")}</span>
          </h2>
          <p className="mt-5 max-w-md text-pretty font-body-lg text-body-lg text-on-surface-variant">
            {t("En visio ou chez vous, nous vous montrons Nuuf avec vos propres cas : quelques biens, un propriétaire, un loyer en retard. Vous posez toutes vos questions.")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[t("Sans jargon"), t("Sans engagement"), t("Sans pression")].map((x, i) => (
              <li key={x} className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 font-label-lg text-label-lg font-semibold text-on-surface ring-1 ring-outline-variant/60">
                <span className="font-label-md text-label-md text-primary">0{i + 1}</span>
                {x}
              </li>
            ))}
          </ul>
          {(MAIL || WA) && (
            <div className="mt-8 flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
              {MAIL && (
                <p>
                  {t("Vous préférez écrire ?")} <a href={`mailto:${MAIL}`} className="font-semibold text-primary underline underline-offset-4">{MAIL}</a>
                </p>
              )}
              {WA && (
                <p>
                  {t("Vous préférez WhatsApp ?")} <a href={`https://wa.me/${WA.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="font-semibold text-primary underline underline-offset-4">{t("Écrivez-nous")}</a>
                </p>
              )}
            </div>
          )}
        </Reveal>
        <Reveal delai={90}>
          <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/50 sm:p-8">
            <h3 className="font-extrabold tracking-tight text-on-surface text-[1.6rem] leading-tight">{t("Réservez votre démo.")}</h3>
            <p className="mb-5 mt-2 font-body-md text-body-md text-on-surface-variant">{t("Laissez vos informations : votre message WhatsApp est prêt à envoyer.")}</p>
            <DemoFormulaire whatsapp={WA} email={MAIL} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

async function AppelFinal({ t }: { t: T }) {
  return (
    <section className="nf-hero relative mx-2 mb-2 overflow-hidden rounded-[2rem] px-5 py-24 text-center text-white sm:py-32 lg:mx-3">
      <div className="nf-blob nf-blob-a" aria-hidden="true" />
      <div className="nf-blob nf-blob-b" aria-hidden="true" />
      <Reveal className="relative z-10">
        <h2 className="mx-auto max-w-4xl text-balance font-extrabold leading-[1] tracking-[-0.04em] text-[clamp(2.4rem,6.6vw,5rem)]">
          {t("Vos loyers n'attendent pas.")}
          <br />
          <span className="text-[#aaf1d8]">{t("À vous de passer devant.")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty font-body-lg text-body-lg text-white/70">{t("Chaque jour de retard, c'est de l'argent qui dort. Essayez Nuuf gratuitement et laissez le logiciel relancer à votre place.")}</p>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-label-lg text-label-lg text-white/80">
          <span>{t("+ de temps")}</span>
          <span>{t("0 cahier")}</span>
          <span>{t("0 Excel")}</span>
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/inscription" className={`${bouton} nf-lueur bg-white text-[#082d23]`}>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            {t("Essayer 14 jours")}
          </Link>
          <Link href="#tarifs" className={`${bouton} bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/15`}>{t("Voir le tarif")}</Link>
        </div>
      </Reveal>
    </section>
  );
}

/** Bulle de contact flottante : WhatsApp si le numéro est configuré, sinon la section Démo. */
function BulleContact({ t }: { t: T }) {
  const href = WA ? `https://wa.me/${WA.replace(/\D/g, "")}` : "#demo";
  return (
    <a
      href={href}
      target={WA ? "_blank" : undefined}
      rel={WA ? "noopener" : undefined}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full bg-surface-container-lowest py-2 pl-2 pr-5 shadow-xl ring-1 ring-outline-variant/60 transition-transform hover:-translate-y-0.5"
    >
      <span className="grid size-10 place-items-center rounded-full bg-primary-container text-lg font-black text-on-primary">n</span>
      <span className="hidden text-left sm:block">
        <span className="block font-label-lg text-label-lg font-bold text-on-surface">{t("Une question ?")}</span>
        <span className="block font-body-sm text-body-sm text-on-surface-variant">{t("Écrivez-nous")}</span>
      </span>
    </a>
  );
}

export default async function Accueil() {
  const { t } = await getT();
  return (
    <main className="pt-16">
      <Hero t={t} />
      <Presentation t={t} />
      <Etapes t={t} />
      <Resume t={t} />
      <Test t={t} />
      <Tarifs t={t} />
      <Faq t={t} />
      <Demo t={t} />
      <AppelFinal t={t} />
      <BulleContact t={t} />
    </main>
  );
}
