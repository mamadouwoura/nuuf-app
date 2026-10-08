import type { MetadataRoute } from "next";

/** Application installable (« Ajouter à l'écran d'accueil »). Aucun cache hors-ligne : les données financières restent toujours à jour. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nuuf — Gestion locative",
    short_name: "Nuuf",
    description: "Encaissez vos loyers par Wave et Orange Money, quittances et relances.",
    lang: "fr",
    start_url: "/tableau-de-bord",
    scope: "/",
    display: "standalone",
    background_color: "#eefaf3",
    theme_color: "#1b6f5a",
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
