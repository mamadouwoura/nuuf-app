"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/client";

/**
 * Vidéo de présentation de l'accueil. Chargée à la demande (métadonnées seulement, image d'aperçu affichée),
 * lue en boucle et sans son quand elle est à l'écran, arrêtée dès qu'elle en sort. Les commandes natives
 * permettent le son, la pause et le plein écran. Aucune lecture automatique si l'appareil demande moins d'animations.
 */
export default function VideoPresentation() {
  const { t } = useT();
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduit) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-[2rem] bg-[#f0fdf3] ring-1 ring-outline-variant/60 aspect-video"
      // Largeur bornée par la hauteur de l'écran : titre + vidéo tiennent ensemble dans la fenêtre (de 28 rem à 68 rem de large).
      style={{ width: "min(100%, clamp(28rem, calc((100svh - 18rem) * 16 / 9), 68rem))" }}
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/nuuf-presentation.mp4"
        poster="/video/nuuf-presentation-poster.jpg"
        preload="metadata"
        muted
        loop
        playsInline
        controls
        controlsList="nodownload noremoteplayback"
        aria-label={t("Vidéo de présentation de Nuuf : ajouter ses biens, encaisser, quittance, relances et tableau de bord")}
      />
    </div>
  );
}
