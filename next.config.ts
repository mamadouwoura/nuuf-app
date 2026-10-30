import type { NextConfig } from "next";

const prod = process.env.NODE_ENV === "production";

// Politique de sécurité du contenu (production uniquement : le mode développement a besoin d'eval et de websockets).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Image Docker minimale : serveur autonome + fichiers strictement nécessaires.
  // Docker : serveur autonome. Netlify construit son propre format.
  output: process.env.NETLIFY ? undefined : "standalone",
  experimental: {
    serverActions: {
      // Plusieurs photos de téléphone dans un même envoi ; le total est borné à 20 Mo par les actions elles-mêmes.
      bodySizeLimit: "25mb",
      // Domaine public derrière le proxy (en plus de l'en-tête X-Forwarded-Host).
      allowedOrigins: process.env.APP_URL ? [new URL(process.env.APP_URL).host] : undefined,
    },
  },
  async headers() {
    return [
      {
        // Polices, images et icônes : changent rarement, gros poids sur réseau mobile.
        source: "/(fonts|img|icons)/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        // Le service worker des notifications push ne doit jamais rester en cache : une mise à jour doit s'appliquer tout de suite.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Les liens de paiement contiennent un jeton secret : ne jamais le transmettre aux sites tiers.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Isole la page des autres fenêtres et sites (fuites inter-origines, attaques de type Spectre).
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          ...(prod
            ? [
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
                { key: "Content-Security-Policy", value: csp },
              ]
            : []),
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
