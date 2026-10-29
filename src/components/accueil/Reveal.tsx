"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fait apparaître son contenu (montée, léger flou, mise à l'échelle) quand il entre à l'écran.
 * Ce qui est déjà visible au chargement ne s'anime pas : pas de scintillement, et rien n'est caché sans JavaScript.
 */
export default function Reveal({ children, className = "", delai = 0 }: { children: React.ReactNode; className?: string; delai?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<"init" | "cache" | "vu">("init");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dejaVisible = el.getBoundingClientRect().top < window.innerHeight * 0.92;
    if (dejaVisible) {
      const id = window.setTimeout(() => setEtat("vu"), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setEtat("cache"), 0);
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEtat("vu");
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => {
      window.clearTimeout(id);
      obs.disconnect();
    };
  }, []);

  const cls = etat === "cache" ? "nf-reveal-cache" : etat === "vu" ? "nf-reveal-vu" : "";
  return (
    <div ref={ref} className={`${cls} ${className}`} style={delai ? { animationDelay: `${delai}ms` } : undefined}>
      {children}
    </div>
  );
}
