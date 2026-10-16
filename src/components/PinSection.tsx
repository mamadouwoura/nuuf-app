import BoutonEnvoi from "@/components/BoutonEnvoi";
import { definirPin, reglerVerrouillage, retirerPin } from "@/app/actions/pin";
import { DELAIS_VERROUILLAGE } from "@/lib/pin";
import { formaterDate } from "@/lib/i18n/format";
import { getT } from "@/lib/i18n/server";

const champ = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";

/** Réglages du code PIN : activation, délai de verrouillage, retrait. */
export default async function PinSection({ pinDefiniLe, verrouillageMin }: { pinDefiniLe: Date | null; verrouillageMin: number }) {
  const { t, locale } = await getT();
  const actif = pinDefiniLe !== null;
  const delais = (
    <select name="delai" defaultValue={verrouillageMin} aria-label={t("Verrouiller après")} className={champ}>
      {DELAIS_VERROUILLAGE.map((m) => (
        <option key={m} value={m}>{t("Verrouiller après {n} min d'inactivité", { n: m })}</option>
      ))}
    </select>
  );

  return (
    <div id="pin" className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">pin</span>
          {t("Code PIN de verrouillage")}
        </h3>
        <span className={`px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${actif ? "bg-success-container text-on-success-container" : "bg-surface-container-high text-on-surface-variant"}`}>
          {actif ? t("Activé") : t("Désactivé")}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {t("Après une période d'inactivité, l'application demande ce code. Utile si vous laissez votre téléphone ou votre ordinateur sans surveillance.")}
        {actif && pinDefiniLe ? ` ${t("Défini le {date}.", { date: formaterDate(pinDefiniLe, locale, { day: "2-digit", month: "long", year: "numeric" }) })}` : ""}
      </p>

      {actif && (
        <form action={reglerVerrouillage} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-space-sm items-end">
          {delais}
          <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-md rounded-xl bg-surface-container text-primary font-label-lg text-label-lg font-semibold">{t("Appliquer")}</BoutonEnvoi>
        </form>
      )}

      <details>
        <summary className="inline-flex items-center gap-2 h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold cursor-pointer select-none">
          <span className="material-symbols-outlined text-[20px]">{actif ? "edit" : "lock"}</span>
          {actif ? t("Changer le code PIN") : t("Activer un code PIN")}
        </summary>
        <form action={definirPin} className="mt-space-sm grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          <input name="pin" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} minLength={4} required autoComplete="new-password" placeholder={t("Nouveau code (4 à 6 chiffres)")} aria-label={t("Nouveau code PIN")} className={champ} />
          <input name="confirmation" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} minLength={4} required autoComplete="new-password" placeholder={t("Confirmez le code")} aria-label={t("Confirmez le code PIN")} className={champ} />
          <input name="motDePasse" type="password" required autoComplete="current-password" placeholder={t("Mot de passe actuel")} aria-label={t("Mot de passe actuel")} className={champ} />
          {delais}
          <BoutonEnvoi enCours={t("Enregistrement…")} className="md:col-span-2 self-start h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold">{t("Enregistrer le code PIN")}</BoutonEnvoi>
        </form>
      </details>

      {actif && (
        <details>
          <summary className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-error font-label-md text-label-md font-semibold cursor-pointer select-none hover:bg-error-container/40">
            {t("Retirer le code PIN")}
          </summary>
          <form action={retirerPin} className="mt-space-sm flex flex-col sm:flex-row gap-space-sm">
            <input name="motDePasse" type="password" required autoComplete="current-password" placeholder={t("Mot de passe actuel")} aria-label={t("Mot de passe actuel")} className={champ} />
            <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-md rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg font-bold">{t("Confirmer le retrait")}</BoutonEnvoi>
          </form>
        </details>
      )}
    </div>
  );
}
