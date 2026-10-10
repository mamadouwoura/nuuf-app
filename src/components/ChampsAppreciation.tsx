import { APPRECIATION, CLES_APPRECIATION } from "@/lib/motifs";

/** Les quatre questions d'appréciation de fin de location (listes fermées). `t` vient de la page serveur. */
export default function ChampsAppreciation({ t, idPrefixe = "appr" }: { t: (cle: string) => string; idPrefixe?: string }) {
  return (
    <fieldset className="w-full flex flex-col gap-space-sm">
      <legend className="font-label-lg text-label-lg text-on-surface font-semibold">{t("Appréciation du locataire (facultative)")}</legend>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {t("Réponses à choix fermés, visibles uniquement des agences et bailleurs Nuuf consultant ce locataire avec son accord. Soyez factuel : le locataire peut en demander la rectification.")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        {CLES_APPRECIATION.map((cle) => (
          <div key={cle}>
            <label htmlFor={`${idPrefixe}_${cle}`} className="block font-label-md text-label-md text-on-surface-variant mb-1">
              {t(APPRECIATION[cle].titre)}
            </label>
            <select id={`${idPrefixe}_${cle}`} name={`appr_${cle}`} defaultValue="" className="w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface">
              <option value="">{t("Non renseigné")}</option>
              {APPRECIATION[cle].options.map((o) => (
                <option key={o.code} value={o.code}>
                  {t(o.libelle)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
