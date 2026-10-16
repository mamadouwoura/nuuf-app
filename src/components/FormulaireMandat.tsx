import BoutonEnvoi from "@/components/BoutonEnvoi";
import SignatureTactile from "@/components/SignatureTactile";
import { enregistrerMandat } from "@/app/actions/proprietaires";
import { getT } from "@/lib/i18n/server";

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none";
const LABEL = "block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs";

export type MandatForm = {
  id: string;
  libelle: string | null;
  commissionPct: number;
  debutLe: Date;
  dureeMois: number;
  reconduction: boolean;
  jourReversement: number;
  plafondTravaux: number | null;
  preavisMois: number;
  agentNom: string | null;
  commissionAgentPct: number;
  signatureAgence: string | null;
  signatureProprietaire: string | null;
};

/** Formulaire de création ou de mise à jour d'un mandat de gestion (un par portefeuille). */
export default async function FormulaireMandat({ proprietaireId, mandat, aujourdhui }: { proprietaireId: string; mandat: MandatForm | null; aujourdhui: string }) {
  const { t } = await getT();
  const k = mandat?.id ?? "nouveau";
  return (
    <form action={enregistrerMandat} className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-sm">
      <input type="hidden" name="id" value={proprietaireId} />
      <input type="hidden" name="mandatId" value={mandat?.id ?? ""} />
      <div className="sm:col-span-2">
        <label htmlFor={`libelle-${k}`} className={LABEL}>{t("Nom du portefeuille (facultatif)")}</label>
        <input id={`libelle-${k}`} name="libelle" maxLength={80} defaultValue={mandat?.libelle ?? ""} placeholder={t("Résidence Almadies")} className={CHAMP} autoComplete="off" />
      </div>
      <div>
        <label htmlFor={`commissionPct-${k}`} className={LABEL}>{t("Commission (% des loyers encaissés)")}</label>
        <input id={`commissionPct-${k}`} name="commissionPct" inputMode="decimal" required defaultValue={mandat ? String(mandat.commissionPct).replace(".", ",") : "10"} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`debutLe-${k}`} className={LABEL}>{t("Début du mandat")}</label>
        <input id={`debutLe-${k}`} name="debutLe" type="date" required defaultValue={mandat ? mandat.debutLe.toISOString().slice(0, 10) : aujourdhui} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`dureeMois-${k}`} className={LABEL}>{t("Durée (mois)")}</label>
        <input id={`dureeMois-${k}`} name="dureeMois" inputMode="numeric" defaultValue={mandat?.dureeMois ?? 12} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`jourReversement-${k}`} className={LABEL}>{t("Reversement avant le (jour du mois)")}</label>
        <input id={`jourReversement-${k}`} name="jourReversement" inputMode="numeric" defaultValue={mandat?.jourReversement ?? 10} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`plafondTravaux-${k}`} className={LABEL}>{t("Travaux sans accord préalable (FCFA)")}</label>
        <input id={`plafondTravaux-${k}`} name="plafondTravaux" inputMode="numeric" defaultValue={mandat?.plafondTravaux ?? ""} placeholder="50 000" className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`preavisMois-${k}`} className={LABEL}>{t("Préavis de résiliation (mois)")}</label>
        <input id={`preavisMois-${k}`} name="preavisMois" inputMode="numeric" defaultValue={mandat?.preavisMois ?? 1} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`agentNom-${k}`} className={LABEL}>{t("Agent apporteur (facultatif)")}</label>
        <input id={`agentNom-${k}`} name="agentNom" defaultValue={mandat?.agentNom ?? ""} maxLength={80} placeholder={t("Nom de l'agent")} className={CHAMP} />
      </div>
      <div>
        <label htmlFor={`commissionAgentPct-${k}`} className={LABEL}>{t("Part de l'agent (% des loyers, prélevée sur la commission)")}</label>
        <input id={`commissionAgentPct-${k}`} name="commissionAgentPct" inputMode="decimal" defaultValue={mandat && mandat.commissionAgentPct > 0 ? String(mandat.commissionAgentPct).replace(".", ",") : ""} placeholder="2" className={CHAMP} />
      </div>
      <label className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
        <input type="checkbox" name="reconduction" defaultChecked={mandat?.reconduction ?? true} className="w-5 h-5 accent-primary" />
        <span className="font-body-md text-body-md text-on-surface">{t("Renouvellement par tacite reconduction")}</span>
      </label>
      <div>
        <p className={LABEL}>{t("Signature de l'agence")}</p>
        <SignatureTactile nom="signatureAgence" existante={mandat?.signatureAgence ?? null} />
      </div>
      <div>
        <p className={LABEL}>{t("Signature du propriétaire")}</p>
        <SignatureTactile nom="signatureProprietaire" existante={mandat?.signatureProprietaire ?? null} />
      </div>
      <div className="sm:col-span-2">
        <BoutonEnvoi enCours={t("Enregistrement…")} className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
          {mandat ? t("Mettre à jour le mandat") : t("Établir le mandat")}
        </BoutonEnvoi>
      </div>
    </form>
  );
}
