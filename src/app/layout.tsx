import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import LocaleBoundary from "@/components/LocaleBoundary";
import "./globals.css";

// Polices intégrées au projet (versions variables, caractères latins : français et anglais) : la construction du site
// ne dépend plus d'un téléchargement chez Google, qui échouait quand la connexion était instable.
const inter = localFont({
  src: "./polices/inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
const jakarta = localFont({
  src: "./polices/jakarta-latin.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b6f5a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1713" },
  ],
};

// Appliqué avant l'affichage : évite le flash blanc en mode sombre et applique le style choisi (Papier par défaut, « classique » sur demande).
const SCRIPT_THEME = `try{var q=new URLSearchParams(location.search).get("style");if(q==="classique")localStorage.setItem("nuuf_style","classique");else if(q==="papier")localStorage.removeItem("nuuf_style");if(localStorage.getItem("nuuf_style")==="classique")document.documentElement.removeAttribute("data-style")}catch(e){}try{var t=localStorage.getItem("nuuf_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export const metadata: Metadata = {
  applicationName: "Nuuf",
  appleWebApp: { capable: true, title: "Nuuf", statusBarStyle: "default" },
  title: { default: "Nuuf — Gestion locative au Sénégal", template: "%s — Nuuf" },
  description: "Encaissez vos loyers par Wave et Orange Money, quittances et relances automatiques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-style="papier" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} antialiased`}>
      <head>
        <link rel="preload" href="/fonts/material-symbols-v2.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface">
        <Suspense fallback={null}>
          <LocaleBoundary>{children}</LocaleBoundary>
        </Suspense>
      </body>
    </html>
  );
}
