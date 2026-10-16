import { Suspense } from "react";
import Preferences from "@/components/Preferences";
import BoutonEnvoi from "@/components/BoutonEnvoi";
import { accepterInvitation } from "@/app/actions/equipe";
import { db } from "@/lib/db";
import { hashJeton, invitationValide } from "@/lib/invitations";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Invitation")), robots: { index: false, follow: false } };
}

const CHAMP = "w-full h-12 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none";
const LABEL = "block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs";

async function Contenu({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const { t } = await getT();
  const [{ jeton }, { erreur }] = await Promise.all([params, searchParams]);
  const inv = await db.invitation.findUnique({ where: { jetonHash: hashJeton(jeton.slice(0, 100)) }, include: { organisation: { select: { nom: true } } } });
  const valide = inv && invitationValide(inv);

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-gutter py-space-xl">
      <Preferences flottant />
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg p-space-lg flex flex-col gap-space-md">
        <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-primary">nuuf</span>
        {!valide ? (
          <>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Invitation indisponible")}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("Ce lien n'est plus valable : il a déjà servi, il a expiré ou il a été annulé. Demandez un nouveau lien à la personne qui vous a invité.")}
            </p>
          </>
        ) : (
          <>
            <div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t("Bonjour {nom}", { nom: inv.nomComplet })}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {t("{org} vous invite à rejoindre son équipe sur Nuuf. Confirmez votre numéro et choisissez votre mot de passe.", { org: inv.organisation.nom })}
              </p>
            </div>
            {erreur && <p role="alert" className="rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-md text-body-md">{erreur}</p>}
            <form action={accepterInvitation} className="flex flex-col gap-space-md">
              <input type="hidden" name="jeton" value={jeton} />
              <div>
                <label htmlFor="telephone" className={LABEL}>{t("Votre numéro de téléphone")}</label>
                <input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="77 123 45 67" className={CHAMP} />
              </div>
              <div>
                <label htmlFor="motDePasse" className={LABEL}>{t("Choisissez un mot de passe")}</label>
                <input id="motDePasse" name="motDePasse" type="password" autoComplete="new-password" required minLength={8} placeholder={t("Au moins 8 caractères")} className={CHAMP} />
              </div>
              <div>
                <label htmlFor="confirmation" className={LABEL}>{t("Confirmez le mot de passe")}</label>
                <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required minLength={8} className={CHAMP} />
              </div>
              <BoutonEnvoi enCours={t("Création du compte…")} className="h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                {t("Rejoindre l'équipe")}
              </BoutonEnvoi>
            </form>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Chaque connexion sera confirmée par un code envoyé sur ce numéro.")}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ erreur?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenu {...props} />
    </Suspense>
  );
}
