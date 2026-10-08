import type { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "@/components/PublicLayout";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export const EDITEUR = process.env.NEXT_PUBLIC_RAISON_SOCIALE || N_("L'éditeur de Nuuf");
export const CONTACT_MAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{titre}</h2>
      <div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-2">{children}</div>
    </section>
  );
}

export default async function PageLegale({ titre, maj, children }: { titre: string; maj: string; children: ReactNode }) {
  const { t } = await getT();
  return (
    <>
      <PublicHeader actif="accueil" />
      <main className="w-full max-w-3xl mx-auto px-margin md:px-margin-tablet pt-32 pb-space-xl flex flex-col gap-space-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{titre}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t("Dernière mise à jour : {date}", { date: maj })}</p>
        </div>
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
