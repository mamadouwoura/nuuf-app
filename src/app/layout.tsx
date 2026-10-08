import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import LocaleBoundary from "@/components/LocaleBoundary";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b6f5a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1713" },
  ],
};

// Appliqué avant l'affichage : évite le flash blanc quand l'utilisateur a choisi le mode sombre.
const SCRIPT_THEME = `try{var t=localStorage.getItem("nuuf_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export const metadata: Metadata = {
  applicationName: "Nuuf",
  appleWebApp: { capable: true, title: "Nuuf", statusBarStyle: "default" },
  title: { default: "Nuuf — Gestion locative au Sénégal", template: "%s — Nuuf" },
  description: "Encaissez vos loyers par Wave et Orange Money, quittances et relances automatiques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} antialiased`}>
      <head>
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
