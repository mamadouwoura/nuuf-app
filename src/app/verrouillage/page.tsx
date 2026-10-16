import { Suspense } from "react";
import { redirect } from "next/navigation";
import Preferences from "@/components/Preferences";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { deconnexion } from "@/app/actions/auth";
import { deverrouiller } from "@/app/actions/pin";
import { getUserMemeVerrouille } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Application verrouillée")), robots: { index: false, follow: false } };
}

async function Contenu({ searchParams }: { searchParams: Promise<{ erreur?: string; suite?: string }> }) {
  const { t } = await getT();
  const { erreur, suite } = await searchParams;
  const s = await getUserMemeVerrouille();
  if (!s) redirect("/connexion");
  if (!s.verrouillee) redirect("/tableau-de-bord");
  const prenom = s.user.nomComplet.split(" ")[0];

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-gutter py-space-xl">
      <Preferences flottant />
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-lg p-space-lg flex flex-col items-center text-center gap-space-md">
        <span className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </span>
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Bonjour {prenom}", { prenom })}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t("Saisissez votre code PIN pour reprendre.")}</p>
        </div>
        {erreur && <p role="alert" className="w-full rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
        <form action={deverrouiller} className="w-full flex flex-col gap-space-md">
          <input type="hidden" name="suite" value={suite ?? ""} />
          <label className="sr-only" htmlFor="pin">{t("Code PIN")}</label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            placeholder="••••"
            className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
          />
          <BoutonEnvoi enCours={t("Vérification…")} className="h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
            {t("Déverrouiller")}
          </BoutonEnvoi>
        </form>
        <form action={deconnexion}>
          <button className="font-label-md text-label-md text-on-surface-variant underline">{t("PIN oublié ? Se déconnecter")}</button>
        </form>
      </div>
    </main>
  );
}

export default function Page(props: { searchParams: Promise<{ erreur?: string; suite?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenu {...props} />
    </Suspense>
  );
}
