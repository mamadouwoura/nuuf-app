"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Phrase qui se construit pendant qu'on défile : quatre temps, collés à l'écran (sticky), qui s'allument l'un après l'autre.
 * La position de défilement est lue une fois par image et l'état ne change qu'aux seuils : peu de travail pour le navigateur.
 */
export default function RecitDefilement({ lignes, final }: { lignes: [string, string]; final: string }) {
  const section = useRef<HTMLElement>(null);
  const [etape, setEtape] = useState(0);
  const image = useRef(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const calc = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      const e = p < 0.1 ? 0 : p < 0.33 ? 1 : p < 0.56 ? 2 : p < 0.78 ? 3 : 4;
      setEtape((v) => (v === e ? v : e));
    };
    const surDefilement = () => {
      cancelAnimationFrame(image.current);
      image.current = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", surDefilement, { passive: true });
    window.addEventListener("resize", surDefilement);
    return () => {
      cancelAnimationFrame(image.current);
      window.removeEventListener("scroll", surDefilement);
      window.removeEventListener("resize", surDefilement);
    };
  }, []);

  return (
    <section ref={section} aria-label={`${lignes[0]} ${lignes[1]} ${final}`} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-7 px-5 text-center overflow-hidden">
        <p className="nf-recit-ligne font-headline-lg text-[clamp(1.6rem,4.2vw,3.25rem)] font-semibold tracking-tight text-on-surface" data-on={etape >= 1} aria-hidden="true">
          {lignes[0]}
        </p>
        <p className="nf-recit-ligne text-[clamp(2rem,5vw,3.75rem)] font-extrabold tracking-tight text-primary" data-on={etape >= 2} aria-hidden="true">
          nuuf<span className="text-secondary-container">.</span>
        </p>
        <p className="nf-recit-ligne font-headline-lg text-[clamp(1.6rem,4.2vw,3.25rem)] font-semibold tracking-tight text-on-surface" data-on={etape >= 3} aria-hidden="true">
          {lignes[1]}
        </p>
        <p
          className="nf-recit-ligne rounded-[2rem] border border-primary-container/40 bg-surface-container-lowest px-7 py-3 font-headline-lg text-[clamp(1.6rem,4.2vw,3.25rem)] font-semibold tracking-tight text-primary shadow-lg"
          data-on={etape >= 4}
          aria-hidden="true"
        >
          {final}
        </p>
      </div>
    </section>
  );
}
