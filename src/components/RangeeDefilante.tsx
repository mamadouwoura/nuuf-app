"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

/**
 * Rangée horizontale à défilement fluide : accroche sur chaque carte (scroll-snap), bords estompés,
 * flèches en pilule, jauge de progression, glisser à la souris, flèches du clavier.
 * Seuls transform et opacity sont animés ; la jauge est mise à jour sans re-rendu pendant le défilement.
 */
export default function RangeeDefilante({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const piste = useRef<HTMLDivElement>(null);
  const jauge = useRef<HTMLDivElement>(null);
  const trame = useRef(0);
  const glisse = useRef<{ x: number; depart: number; bouge: boolean } | null>(null);
  const [bords, setBords] = useState({ debut: true, fin: false });
  const [deborde, setDeborde] = useState(true);

  const mesurer = useCallback(() => {
    const el = piste.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const part = max > 0 ? el.clientWidth / el.scrollWidth : 1;
    const avance = max > 0 ? el.scrollLeft / max : 0;
    if (jauge.current) {
      jauge.current.style.width = `${Math.max(part, 0.12) * 100}%`;
      jauge.current.style.transform = `translate3d(${avance * (1 / Math.max(part, 0.12) - 1) * 100}%,0,0)`;
    }
    const debut = el.scrollLeft <= 6;
    const fin = el.scrollLeft >= max - 6;
    setBords((b) => (b.debut === debut && b.fin === fin ? b : { debut, fin }));
    setDeborde(max > 2);
  }, []);

  useEffect(() => {
    mesurer();
    const el = piste.current;
    if (!el) return;
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(trame.current);
    };
  }, [mesurer]);

  const surDefilement = () => {
    cancelAnimationFrame(trame.current);
    trame.current = requestAnimationFrame(mesurer);
  };
  const pas = (sens: 1 | -1) => {
    const el = piste.current;
    if (!el) return;
    const carte = el.firstElementChild as HTMLElement | null;
    const largeur = (carte?.offsetWidth ?? el.clientWidth * 0.8) + 24;
    el.scrollBy({ left: sens * largeur, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  function appui(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    glisse.current = { x: e.clientX, depart: piste.current?.scrollLeft ?? 0, bouge: false };
  }
  function bouge(e: React.PointerEvent) {
    const g = glisse.current;
    const el = piste.current;
    if (!g || !el) return;
    const dx = e.clientX - g.x;
    if (!g.bouge && Math.abs(dx) < 6) return;
    if (!g.bouge) {
      g.bouge = true;
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      el.style.cursor = "grabbing";
    }
    el.scrollLeft = g.depart - dx;
  }
  function relache() {
    const g = glisse.current;
    const el = piste.current;
    glisse.current = null;
    if (!g?.bouge || !el) return;
    el.style.cursor = "";
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    // rendre la main à l'accroche : un léger pas vers la carte la plus proche
    el.scrollBy({ left: 1, behavior: "smooth" });
    setTimeout(() => (g.bouge = false), 0);
  }

  const bouton = "w-11 h-11 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface flex items-center justify-center transition-[transform,opacity] duration-200 active:scale-95 disabled:opacity-35 disabled:pointer-events-none hover:bg-surface-container";
  const masque = `linear-gradient(to right, ${bords.debut ? "#000" : "transparent"} 0, #000 28px, #000 calc(100% - 28px), ${bords.fin ? "#000" : "transparent"} 100%)`;

  return (
    <div>
      <div
        ref={piste}
        role="region"
        tabIndex={0}
        aria-label={t("Fonctionnalités, à faire défiler")}
        onScroll={surDefilement}
        onPointerDown={appui}
        onPointerMove={bouge}
        onPointerUp={relache}
        onPointerLeave={relache}
        onClickCapture={(e) => {
          if (glisse.current?.bouge) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-1 scroll-smooth overscroll-x-contain pb-2 -mx-1 px-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-3xl [&>*]:shrink-0 [&>*]:snap-start [&>*]:w-[84%] sm:[&>*]:w-[calc(50%-12px)] lg:[&>*]:w-[calc(33.333%-16px)]"
        style={{ WebkitMaskImage: masque, maskImage: masque, scrollbarWidth: "none", touchAction: "pan-x pan-y" }}
      >
        {children}
      </div>
      {deborde && (
        <div className="mt-6 flex items-center gap-4">
          <div className="relative flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden" aria-hidden="true">
            <div ref={jauge} className="absolute inset-y-0 left-0 rounded-full bg-primary-container will-change-transform" style={{ width: "30%" }} />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => pas(-1)} disabled={bords.debut} aria-label={t("Faire défiler vers la gauche")} className={bouton}>
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <button type="button" onClick={() => pas(1)} disabled={bords.fin} aria-label={t("Faire défiler vers la droite")} className={bouton}>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
