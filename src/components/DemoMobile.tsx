"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { Decor, Pastilles, PLATEAU, FOND_ECRAN, PASTILLE_ON, PASTILLE_OFF } from "@/components/DemoDecor";

const DUREE = 7000; // ms par écran
const NB = 4;

/** Démonstration animée : un téléphone déroule les quatre temps forts de Nuuf, du tableau de bord à la relance WhatsApp. */
export default function DemoMobile() {
  const { t } = useT();
  const [actif, setActif] = useState(0);
  const [progres, setProgres] = useState(0);
  const [survol, setSurvol] = useState(false);
  const [arret, setArret] = useState(false);
  const pause = survol || arret;
  const [visible, setVisible] = useState(false);
  const racine = useRef<HTMLElement>(null);
  const horloge = useRef({ dernier: 0, ecoule: 0 });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (racine.current) obs.observe(racine.current);
    return () => obs.disconnect();
  }, []);

  const aller = useCallback((i: number) => {
    horloge.current = { dernier: 0, ecoule: 0 };
    setProgres(0);
    setActif(((i % NB) + NB) % NB);
  }, []);

  useEffect(() => {
    if (!visible || pause) {
      horloge.current.dernier = 0;
      return;
    }
    const id = setInterval(() => {
      const h = horloge.current;
      const now = performance.now();
      if (h.dernier) h.ecoule += now - h.dernier;
      h.dernier = now;
      if (h.ecoule >= DUREE) {
        h.ecoule = 0;
        setProgres(0);
        setActif((a) => (a + 1) % NB);
      } else {
        setProgres(h.ecoule / DUREE);
      }
    }, 80);
    return () => clearInterval(id);
  }, [visible, pause]);

  const etapes = [
    { icone: "dashboard", titre: t("Votre parc en un coup d'œil"), texte: t("Loyers encaissés, en attente et en retard : tout est clair dès l'ouverture, bien par bien.") },
    { icone: "account_balance_wallet", titre: t("Le loyer arrive sur votre compte"), texte: t("Votre locataire paie en un clic par Wave ou Orange Money depuis un lien. Aucune application à installer.") },
    { icone: "receipt_long", titre: t("La quittance se génère seule"), texte: t("Un PDF numéroté avec un QR code d'authentification, prêt à être envoyé au locataire.") },
    { icone: "forum", titre: t("Les retards se relancent d'un geste"), texte: t("Un message courtois sur WhatsApp, avec le lien de paiement. Fini les appels gênants.") },
  ];

  return (
    <section
      ref={racine}
      id="demonstration"
      className="w-full py-20 bg-surface-container-lowest"
    >
      <div className="w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-primary">{t("Démonstration")}</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">{t("Nuuf en action, sur votre téléphone")}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{t("Du loyer encaissé à la quittance envoyée, en quatre écrans.")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <ol className="lg:col-span-6 order-2 lg:order-1 flex flex-col gap-2">
            {etapes.map((e, i) => {
              const on = i === actif;
              return (
                <li key={e.titre}>
                  <button
                    type="button"
                    onClick={() => aller(i)}
                    aria-current={on ? "step" : undefined}
                    className={`group w-full text-left flex gap-4 rounded-2xl p-4 sm:p-5 transition-colors ${on ? "bg-surface-container-lowest shadow-md" : "hover:bg-surface-container-lowest/60"}`}
                  >
                    <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${on ? `${PASTILLE_ON[i]} text-white` : PASTILLE_OFF[i]}`}>
                      <span className="material-symbols-outlined text-[22px]">{e.icone}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-outline tabular-nums">0{i + 1}</span>
                        <span className={`font-headline-sm text-headline-sm font-bold ${on ? "text-on-surface" : "text-on-surface-variant"}`}>{e.titre}</span>
                      </span>
                      <span className={`grid transition-all duration-500 ${on ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"}`}>
                        <span className="overflow-hidden">
                          <span className="block font-body-md text-body-md text-on-surface-variant leading-relaxed">{e.texte}</span>
                          <span className="block mt-3 h-[3px] rounded-full bg-primary/15 overflow-hidden">
                            <span className="block h-full rounded-full bg-primary" style={{ width: `${progres * 100}%` }} />
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center gap-4 lg:sticky lg:top-24" onMouseEnter={() => setSurvol(true)} onMouseLeave={() => setSurvol(false)}>
            <div className="relative w-full max-w-[540px] rounded-[2.5rem] px-6 pt-10 pb-12 overflow-hidden transition-colors duration-700" style={{ background: PLATEAU[actif] }}>
              <Decor actif={actif} />
              <div className="relative z-10 flex justify-center"><Telephone actif={actif} t={t} /></div>
              <Pastilles actif={actif} />
            </div>
            <button type="button" onClick={() => setArret((a) => !a)} className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">{arret ? "play_arrow" : "pause"}</span>
              {arret ? t("Relancer l'animation") : t("Mettre en pause")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type T = ReturnType<typeof useT>["t"];

const LARG = 292;
const HAUT = 600;

/** Échelle qui garde le téléphone entier à l'écran : titre fixe + bouton pause réservés, taille réduite si la fenêtre est basse. */
function useEchelle() {
  const [e, setE] = useState(1);
  useEffect(() => {
    const calc = () => setE(Math.min(1, Math.max(0.5, (window.innerHeight - 190) / HAUT)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return e;
}

function Telephone({ actif, t }: { actif: number; t: T }) {
  const e = useEchelle();
  return (
    <div className="relative" aria-hidden="true" style={{ width: LARG * e, height: HAUT * e }}>
      <div className="absolute inset-x-6 -bottom-4 h-8 rounded-[50%] bg-primary/20 blur-2xl" />
      <div className="absolute left-0 top-0" style={{ width: LARG, height: HAUT, transform: `scale(${e})`, transformOrigin: "top left" }}>
      <div className="palette-claire relative w-full h-full rounded-[46px] bg-[#0f1713] p-[10px] shadow-2xl ring-1 ring-black/30">
        <div className="relative w-full h-full rounded-[36px] bg-surface overflow-hidden transition-colors duration-700" style={{ background: FOND_ECRAN[actif] }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-[#0f1713] z-20" />
          <div className="absolute top-0 inset-x-0 h-10 z-10 flex items-end justify-between px-6 pb-1 text-[10px] font-semibold text-on-surface">
            <span>9:41</span>
            <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
          </div>
          {[Tableau, Paiement, Quittance, Relance].map((Ecran, i) => (
            <div
              key={i}
              className="absolute inset-0 pt-11 px-4 pb-4 transition-all duration-700 ease-out"
              style={{ opacity: i === actif ? 1 : 0, transform: i === actif ? "none" : i < actif ? "translateY(-14px) scale(0.98)" : "translateY(14px) scale(0.98)", pointerEvents: "none" }}
            >
              {i === actif && <Ecran t={t} />}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

const d = (ms: number) => ({ animationDelay: `${ms}ms` });

function Tableau({ t }: { t: T }) {
  const barres = [38, 54, 46, 70, 62, 88];
  const lignes = [
    { nom: "Awa Diallo", bien: "Almadies · A12", montant: "350 000", etat: t("Payé"), cl: "bg-success-container text-on-success-container" },
    { nom: "Moussa Ndiaye", bien: "Mbour · Villa 3", montant: "250 000", etat: t("En attente"), cl: "bg-secondary-fixed text-on-secondary-fixed" },
    { nom: "Fatou Sow", bien: "Ouakam · Studio", montant: "180 000", etat: t("En retard"), cl: "bg-error-container text-on-error-container" },
  ];
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="demo-entre" style={d(0)}>
        <p className="text-[11px] text-on-surface-variant">{t("Bonjour")}</p>
        <p className="text-[17px] font-extrabold text-on-surface leading-tight">Mamadou</p>
      </div>
      <div className="demo-entre rounded-2xl bg-gradient-to-br from-primary to-tertiary-container text-on-primary p-4 shadow-md" style={d(120)}>
        <p className="text-[11px] opacity-80">{t("Encaissé ce mois")}</p>
        <p className="text-[24px] font-extrabold leading-tight tabular-nums">1 250 000 <span className="text-[12px] font-bold opacity-80">FCFA</span></p>
        <div className="mt-3 flex items-end gap-1.5 h-12">
          {barres.map((h, i) => (
            <span key={i} className="demo-barre flex-1 rounded-t-md bg-on-primary/85" style={{ height: `${h}%`, ...d(350 + i * 90) }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {[{ n: "8", l: t("Payés"), c: "bg-success-container text-on-success-container" }, { n: "2", l: t("En attente"), c: "bg-secondary-fixed text-on-secondary-fixed" }, { n: "1", l: t("En retard"), c: "bg-error-container text-on-error-container" }].map((k, i) => (
          <div key={k.l} className={`demo-entre flex-1 rounded-xl px-2 py-2 text-center ${k.c}`} style={d(300 + i * 90)}>
            <p className="text-[18px] font-extrabold leading-none">{k.n}</p>
            <p className="text-[9.5px] font-semibold mt-1">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {lignes.map((l, i) => (
          <div key={l.nom} className="demo-entre flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm" style={d(650 + i * 130)}>
            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary text-[11px] font-bold flex items-center justify-center">{l.nom.split(" ").map((m) => m[0]).join("")}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold text-on-surface truncate">{l.nom}</span>
              <span className="block text-[10px] text-on-surface-variant truncate">{l.bien}</span>
            </span>
            <span className="text-right">
              <span className="block text-[11.5px] font-bold text-on-surface tabular-nums">{l.montant}</span>
              <span className={`inline-block mt-0.5 px-1.5 py-px rounded-full text-[9px] font-bold ${l.cl}`}>{l.etat}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Paiement({ t }: { t: T }) {
  return (
    <div className="h-full flex flex-col items-center text-center gap-3 pt-3">
      <div className="demo-entre -mx-4 -mt-3 w-[calc(100%+2rem)] px-4 pt-6 pb-5 bg-gradient-to-br from-[#0a7fa3] to-[#1dc8ff] text-white rounded-b-3xl" style={d(0)}>
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">{t("Loyer d'octobre")}</p>
        <p className="text-[30px] font-extrabold tabular-nums leading-none mt-1">250 000 <span className="text-[13px] font-bold opacity-90">FCFA</span></p>
      </div>
      <div className="demo-entre w-full rounded-2xl bg-white p-3 text-left shadow-sm" style={d(220)}>
        <p className="text-[10px] text-on-surface-variant mb-2">{t("Payer avec")}</p>
        <div className="flex gap-2">
          <span className="demo-choix flex-1 rounded-xl px-2 py-2.5 text-[12px] font-bold text-center bg-[#1dc8ff]/25 text-[#066a88]" style={d(900)}>Wave</span>
          <span className="flex-1 rounded-xl px-2 py-2.5 text-[12px] font-bold text-center bg-surface-container text-on-surface-variant">Orange Money</span>
        </div>
      </div>
      <div className="demo-entre relative mt-4 w-28 h-28 flex items-center justify-center" style={d(1500)}>
        <span className="demo-onde absolute inset-0 rounded-full bg-success/20" style={d(2200)} />
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" className="text-success demo-trace" pathLength={1} style={d(1700)} />
          <path d="M30 52 L45 66 L71 36" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-success demo-trace" pathLength={1} style={d(2300)} />
        </svg>
      </div>
      <div className="demo-entre" style={d(2800)}>
        <p className="text-[15px] font-extrabold text-on-surface">{t("Paiement reçu")}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{t("Quittance générée automatiquement")}</p>
      </div>
    </div>
  );
}

function Quittance({ t }: { t: T }) {
  const qr = "1110111010111011100100011101001010111010010101110100100010110101110111010111011".split("");
  return (
    <div className="h-full flex flex-col gap-3 pt-1">
      <p className="demo-entre self-start rounded-full bg-[#ffba09] px-3 py-1 text-[12px] font-extrabold text-[#1a1f1c]" style={d(0)}>{t("Quittance de loyer")}</p>
      <div className="demo-feuille relative rounded-2xl bg-surface-container-lowest p-4 shadow-lg ring-1 ring-black/5" style={d(150)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[15px] font-black lowercase text-primary leading-none">nuuf</p>
            <p className="text-[9px] text-on-surface-variant mt-1">N° Q-2026-0042</p>
          </div>
          <span className="demo-tampon absolute top-3 right-3 rotate-[-10deg] rounded-md border-2 border-success px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-success" style={d(1700)}>{t("Payée")}</span>
        </div>
        <div className="mt-4 space-y-2">
          {[[t("Locataire"), "Awa Diallo"], [t("Bien"), "Almadies · A12"], [t("Période"), t("Octobre 2026")], [t("Mode"), "Wave"]].map(([k, v], i) => (
            <div key={k} className="demo-entre flex justify-between text-[10.5px]" style={d(400 + i * 110)}>
              <span className="text-on-surface-variant">{k}</span>
              <span className="font-semibold text-on-surface">{v}</span>
            </div>
          ))}
        </div>
        <div className="demo-entre mt-3 pt-3 border-t border-dashed border-outline-variant flex items-end justify-between" style={d(950)}>
          <div>
            <p className="text-[9px] text-on-surface-variant">{t("Montant")}</p>
            <p className="text-[18px] font-extrabold text-on-surface tabular-nums leading-tight">250 000 <span className="text-[10px]">FCFA</span></p>
          </div>
          <div className="grid grid-cols-9 gap-px w-[54px] h-[54px] p-1 rounded-md bg-white ring-1 ring-black/10">
            {qr.map((c, i) => (
              <span key={i} className={c === "1" ? "bg-[#0f1713] demo-pixel" : "bg-transparent"} style={d(1100 + (i % 9) * 30 + Math.floor(i / 9) * 20)} />
            ))}
          </div>
        </div>
      </div>
      <div className="demo-entre mt-auto flex gap-2" style={d(2000)}>
        <span className="flex-1 rounded-full bg-[#168a3e] text-white text-[12px] font-bold py-2.5 text-center">{t("Envoyer sur WhatsApp")}</span>
        <span className="rounded-full bg-[#1a1f1c] text-white text-[12px] font-bold px-3.5 py-2.5">PDF</span>
      </div>
    </div>
  );
}

function Relance({ t }: { t: T }) {
  return (
    <div className="h-full flex flex-col gap-2.5 pt-1">
      <div className="demo-entre flex items-center gap-2.5 pb-2 border-b border-outline-variant/40" style={d(0)}>
        <span className="w-8 h-8 rounded-full bg-[#168a3e] text-white text-[11px] font-bold flex items-center justify-center">FS</span>
        <span>
          <span className="block text-[12.5px] font-bold text-on-surface leading-tight">Fatou Sow</span>
          <span className="block text-[10px] text-success font-semibold">WhatsApp</span>
        </span>
      </div>
      <div className="demo-bulle self-end max-w-[88%] rounded-2xl rounded-tr-md bg-[#d9fdd3] text-[#0b3d2e] shadow-sm px-3 py-2 text-[11.5px] leading-snug" style={d(500)}>
        {t("Bonjour Fatou, un petit rappel : le loyer de 180 000 FCFA est en attente. Vous pouvez payer ici :")}
        <span className="block mt-1.5 rounded-lg bg-surface-container-lowest/70 px-2 py-1.5 text-[10.5px] font-semibold text-primary">nuuf.sn/payer/F7K2</span>
      </div>
      <div className="demo-bulle self-start rounded-2xl rounded-tl-md bg-white shadow-sm px-3 py-2 text-[11.5px] text-on-surface" style={d(2000)}>
        {t("Merci, je paie maintenant 🙏")}
      </div>
      <div className="demo-bulle self-end max-w-[88%] rounded-2xl rounded-tr-md bg-[#d9fdd3] text-[#0b3d2e] shadow-sm px-3 py-2 text-[11.5px] leading-snug" style={d(3400)}>
        <span className="flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
          {t("Paiement reçu — quittance envoyée")}
        </span>
      </div>
    </div>
  );
}
