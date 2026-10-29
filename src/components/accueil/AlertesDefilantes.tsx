"use client";

import { useEffect, useRef } from "react";

export type Alerte = { titre: string; detail: string; quand: string };

const VITESSE = 0.045; // pixels par milliseconde (≈ 45 px/s)

/**
 * Bande d'alertes qui défile toute seule ET se fait balayer au doigt ou à la souris : le défilement est un vrai défilement
 * horizontal de la page (scrollLeft), pas une animation figée. Il se met en pause au toucher, au survol et hors écran,
 * reprend 1,5 s après le dernier geste, et boucle sans à-coup dans les deux sens. Si l'appareil demande moins d'animations,
 * il n'avance plus seul mais reste balayable.
 */
export default function AlertesDefilantes({ alertes, libelle }: { alertes: Alerte[]; libelle: string }) {
  const zone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pause = false;
    let visible = false;
    let image = 0;
    let dernier = 0;
    let position = 0;
    let reprise = 0;

    const moitie = () => el.scrollWidth / 2;
    const rebouclerManuel = () => {
      const m = moitie();
      if (m <= 0) return;
      if (el.scrollLeft >= m) el.scrollLeft -= m;
      else if (el.scrollLeft <= 0) el.scrollLeft += m;
    };
    const surDefilement = () => {
      rebouclerManuel();
      if (pause) position = el.scrollLeft;
    };
    const arreter = () => {
      pause = true;
      window.clearTimeout(reprise);
      position = el.scrollLeft;
    };
    const relancer = (delai: number) => {
      window.clearTimeout(reprise);
      reprise = window.setTimeout(() => {
        pause = false;
        position = el.scrollLeft;
      }, delai);
    };

    const boucle = (t: number) => {
      if (dernier && !reduit && visible && !pause) {
        const m = moitie();
        position += (t - dernier) * VITESSE;
        if (m > 0 && position >= m) position -= m;
        el.scrollLeft = position;
      }
      dernier = t;
      image = requestAnimationFrame(boucle);
    };

    el.scrollLeft = 1; // permet de balayer vers la gauche dès le départ
    position = 1;
    const obs = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    const debutToucher = () => arreter();
    const finToucher = () => relancer(1500);
    const entree = () => arreter();
    const sortie = () => relancer(600);
    el.addEventListener("scroll", surDefilement, { passive: true });
    el.addEventListener("touchstart", debutToucher, { passive: true });
    el.addEventListener("touchend", finToucher, { passive: true });
    el.addEventListener("touchcancel", finToucher, { passive: true });
    el.addEventListener("pointerenter", entree);
    el.addEventListener("pointerleave", sortie);
    image = requestAnimationFrame(boucle);
    return () => {
      cancelAnimationFrame(image);
      window.clearTimeout(reprise);
      obs.disconnect();
      el.removeEventListener("scroll", surDefilement);
      el.removeEventListener("touchstart", debutToucher);
      el.removeEventListener("touchend", finToucher);
      el.removeEventListener("touchcancel", finToucher);
      el.removeEventListener("pointerenter", entree);
      el.removeEventListener("pointerleave", sortie);
    };
  }, []);

  const piste = [...alertes, ...alertes];
  return (
    <div
      ref={zone}
      role="group"
      aria-label={libelle}
      tabIndex={0}
      className="nf-alertes relative z-10 mt-4 flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ touchAction: "pan-x pan-y", scrollbarWidth: "none" }}
    >
      {piste.map((a, i) => (
        <div key={i} aria-hidden={i >= alertes.length ? true : undefined} className="flex w-[17.5rem] shrink-0 items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left ring-1 ring-white/15 backdrop-blur sm:w-[19rem]">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#aaf1d8]/20 text-[#aaf1d8]">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-label-lg text-label-lg font-semibold">{a.titre}</span>
            <span className="block truncate font-body-sm text-body-sm text-white/65">{a.detail}</span>
          </span>
          <span className="shrink-0 font-body-sm text-[11px] text-white/45">{a.quand}</span>
        </div>
      ))}
    </div>
  );
}
