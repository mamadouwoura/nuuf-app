import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = { themeColor: "#1b6f5a" };

export const metadata: Metadata = {
  applicationName: "Nuuf",
  appleWebApp: { capable: true, title: "Nuuf", statusBarStyle: "default" },
  title: { default: "Nuuf — Gestion locative au Sénégal", template: "%s — Nuuf" },
  description: "Encaissez vos loyers par Wave et Orange Money, quittances et relances automatiques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable} antialiased`}>
      <body className="bg-surface font-body-md text-body-md text-on-surface">{children}</body>
    </html>
  );
}
