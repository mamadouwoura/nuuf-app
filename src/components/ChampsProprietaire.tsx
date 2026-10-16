import { getT } from "@/lib/i18n/server";

const CHAMP = "w-full h-11 px-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-60";
const LABEL = "block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs";

export type ValeursProprietaire = {
  nomComplet?: string;
  personneMorale?: boolean;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  ville?: string | null;
  typePiece?: string | null;
  cni?: string | null;
  pieceEtablieLe?: Date | null;
  bp?: string | null;
  compteContribuable?: string | null;
};

/** Champs de la fiche d'un propriétaire, particulier ou société (création et modification). */
export default async function ChampsProprietaire({ v = {}, desactive = false }: { v?: ValeursProprietaire; desactive?: boolean }) {
  const { t } = await getT();
  return (
    <>
      <label className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3 cursor-pointer">
        <input type="checkbox" name="personneMorale" defaultChecked={v.personneMorale} disabled={desactive} className="w-5 h-5 accent-primary" />
        <span className="font-body-md text-body-md text-on-surface">{t("Le propriétaire est une société (personne morale)")}</span>
      </label>
      <div className="sm:col-span-2">
        <label htmlFor="nomComplet" className={LABEL}>{t("Prénom et nom, ou raison sociale")}</label>
        <input id="nomComplet" name="nomComplet" required defaultValue={v.nomComplet} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="telephone" className={LABEL}>{t("Téléphone mobile & WhatsApp")}</label>
        <input id="telephone" name="telephone" type="tel" inputMode="tel" defaultValue={v.telephone ? v.telephone.replace("+221", "") : ""} placeholder="77 000 00 00" className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="email" className={LABEL}>{t("E-mail (facultatif)")}</label>
        <input id="email" name="email" type="email" defaultValue={v.email ?? ""} maxLength={120} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="adresse" className={LABEL}>{t("Domicile ou siège social")}</label>
        <input id="adresse" name="adresse" defaultValue={v.adresse ?? ""} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="ville" className={LABEL}>{t("Ville")}</label>
        <input id="ville" name="ville" defaultValue={v.ville ?? ""} maxLength={80} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="bp" className={LABEL}>{t("Boîte postale (facultatif)")}</label>
        <input id="bp" name="bp" defaultValue={v.bp ?? ""} maxLength={40} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="typePiece" className={LABEL}>{t("Type de pièce")}</label>
        <select id="typePiece" name="typePiece" defaultValue={v.typePiece ?? ""} className={CHAMP} disabled={desactive}>
          <option value="">—</option>
          <option value="CNI">{t("Carte nationale d'identité")}</option>
          <option value="PASSEPORT">{t("Passeport")}</option>
          <option value="RCCM">{t("RCCM (société)")}</option>
          <option value="AUTRE">{t("Autre")}</option>
        </select>
      </div>
      <div>
        <label htmlFor="cni" className={LABEL}>{t("Numéro de la pièce")}</label>
        <input id="cni" name="cni" defaultValue={v.cni ?? ""} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
      <div>
        <label htmlFor="pieceEtablieLe" className={LABEL}>{t("Pièce établie le")}</label>
        <input id="pieceEtablieLe" name="pieceEtablieLe" type="date" defaultValue={v.pieceEtablieLe ? v.pieceEtablieLe.toISOString().slice(0, 10) : ""} className={CHAMP} disabled={desactive} />
      </div>
      <div>
        <label htmlFor="compteContribuable" className={LABEL}>{t("Compte contribuable (NINEA)")}</label>
        <input id="compteContribuable" name="compteContribuable" defaultValue={v.compteContribuable ?? ""} maxLength={40} className={CHAMP} autoComplete="off" disabled={desactive} />
      </div>
    </>
  );
}
