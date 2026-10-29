"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

export type LienNav = { id: string; href: string; label: string };

/** Sections de la page sans lien dans la barre : elles gardent allumé le lien de la section qui les précède. */
const RATTACHEES: Record<string, string> = { demonstration: "comment-ca-marche", securite: "fonctionnalites" };

/**
 * Barre de navigation du site public : la pastille verte glisse vers le lien cliqué et suit le défilement de la page.
 * Seuls transform et width de la pastille sont animés. Avant la mesure (ou sans JavaScript), le lien actif porte son propre fond.
 */
export default function NavPublique({ liens, actifInitial, suivreDefilement }: { liens: LienNav[]; actifInitial: string; suivreDefilement: boolean }) {
  const { t } = useT();
  const [actif, setActif] = useState(actifInitial);
  const [pret, setPret] = useState(false);
  const conteneur = useRef<HTMLElement>(null);
  const pastille = useRef<HTMLSpanElement>(null);
  const verrou = useRef(0); // pas de suivi du défilement pendant le trajet déclenché par un clic

  const placer = useCallback(() => {
    const el = conteneur.current?.querySelector<HTMLElement>(`[data-nav="${actif}"]`);
    const p = pastille.current;
    if (!el || !p) return;
    p.style.width = `${el.offsetWidth}px`;
    p.style.transform = `translate3d(${el.offsetLeft}px,0,0)`;
    setPret(true);
  }, [actif]);

  useLayoutEffect(() => {
    placer();
  }, [placer]);

  useEffect(() => {
    const c = conteneur.current;
    if (!c) return;
    const ro = new ResizeObserver(placer);
    ro.observe(c);
    void document.fonts?.ready.then(placer);
    return () => ro.disconnect();
  }, [placer]);

  useEffect(() => {
    if (!suivreDefilement) return;
    const depuisAncre = location.hash.slice(1);
    const initial = depuisAncre && liens.some((l) => l.id === depuisAncre) ? window.setTimeout(() => setActif(depuisAncre), 0) : 0;
    const ids = [...new Set([...liens.map((l) => l.id), ...Object.keys(RATTACHEES), "accueil"])];
    const obs = new IntersectionObserver(
      (entrees) => {
        if (Date.now() < verrou.current) return;
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          const id = RATTACHEES[e.target.id] ?? e.target.id;
          if (liens.some((l) => l.id === id)) setActif(id);
          else if (e.target.id === "accueil") setActif(""); // haut de page sans lien « Accueil » : plus de pastille
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => {
      window.clearTimeout(initial);
      obs.disconnect();
    };
  }, [liens, suivreDefilement]);

  return (
    <nav ref={conteneur} aria-label={t("Navigation du site")} className="relative hidden xl:flex items-center gap-space-lg">
      <span
        ref={pastille}
        aria-hidden="true"
        className="pilule-nav absolute left-0 top-0 bottom-0 rounded-xl bg-primary-container transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none pointer-events-none"
        style={{ opacity: pret ? 1 : 0, width: 0 }}
      />
      {liens.map((l) => {
        const on = l.id === actif;
        return (
          <Link
            key={l.id}
            href={l.href}
            data-nav={l.id}
            aria-current={on ? "location" : undefined}
            onClick={() => {
              verrou.current = Date.now() + 1100;
              setActif(l.id);
            }}
            className={`relative z-10 px-space-sm py-space-xs font-label-lg text-label-lg rounded-xl transition-colors duration-200 ${
              on ? `text-on-primary-container ${pret ? "" : "bg-primary-container"}` : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
