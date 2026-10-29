"use client";

import { useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { N_ } from "@/lib/i18n/translate";
import { EXEMPLE, MODELE_AVANT_DEFAUT, MODELE_MAX, MODELE_RETARD_DEFAUT, VARIABLES, remplirModele, type Variable } from "@/lib/relances-regles";

const QUOI: Record<Variable, string> = {
  prenom: N_("Prénom du locataire"),
  nom: N_("Nom complet"),
  montant: N_("Montant restant dû"),
  bien: N_("Nom du bien"),
  mois: N_("Mois du loyer"),
  echeance: N_("Date d'échéance"),
  jours: N_("Jours de retard"),
  lien: N_("Lien de paiement"),
};

function Editeur({ nom, titre, aide, initial, defaut }: { nom: string; titre: string; aide: string; initial: string; defaut: string }) {
  const { t } = useT();
  const zone = useRef<HTMLTextAreaElement>(null);
  const [texte, setTexte] = useState(initial);

  function inserer(v: Variable) {
    const el = zone.current;
    const ajout = `{${v}}`;
    if (!el) return setTexte((x) => `${x}${ajout}`);
    const debut = el.selectionStart ?? texte.length;
    const fin = el.selectionEnd ?? texte.length;
    const suivant = `${texte.slice(0, debut)}${ajout}${texte.slice(fin)}`.slice(0, MODELE_MAX);
    setTexte(suivant);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(debut + ajout.length, debut + ajout.length);
    });
  }

  const apercu = remplirModele(texte.trim() || defaut, EXEMPLE);
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-3">
      <label htmlFor={nom} className="font-label-lg text-label-lg font-semibold text-on-surface">{titre}</label>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{aide}</p>
      <textarea
        id={nom}
        ref={zone}
        name={nom}
        value={texte}
        onChange={(e) => setTexte(e.target.value.slice(0, MODELE_MAX))}
        rows={4}
        placeholder={defaut}
        maxLength={MODELE_MAX}
        className="w-full rounded-xl bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface ring-1 ring-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container"
      />
      <div className="flex flex-wrap items-center gap-1.5" aria-label={t("Variables disponibles")}>
        {VARIABLES.map((v) => (
          <button key={v} type="button" title={t(QUOI[v])} onClick={() => inserer(v)} className="rounded-full bg-surface-container-lowest px-2.5 py-1 font-label-md text-label-md font-semibold text-primary ring-1 ring-outline-variant/60 hover:bg-surface-container">
            {`{${v}}`}
          </button>
        ))}
        {texte.trim() !== "" && (
          <button type="button" onClick={() => setTexte("")} className="ml-auto rounded-full px-2.5 py-1 font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface">
            {t("Revenir au texte par défaut")}
          </button>
        )}
      </div>
      <div className="rounded-xl bg-[#d9fdd3] px-3 py-2 text-[#0b3d2e]">
        <p className="mb-1 font-body-sm text-[11px] font-semibold uppercase tracking-wider opacity-70">{t("Aperçu")}</p>
        <p className="whitespace-pre-line font-body-md text-body-md">{apercu}</p>
      </div>
      <p className="text-right font-body-sm text-[11px] text-on-surface-variant">{texte.length} / {MODELE_MAX}</p>
    </div>
  );
}

/** Les deux textes de relance (avant l'échéance, après l'échéance), avec variables cliquables et aperçu en direct. */
export default function ModelesRelance({ avant, retard }: { avant: string | null; retard: string | null }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-3">
      <Editeur nom="modeleAvant" titre={t("Message avant ou le jour de l'échéance")} aide={t("Laissez vide pour garder le texte par défaut.")} initial={avant ?? ""} defaut={MODELE_AVANT_DEFAUT} />
      <Editeur nom="modeleRetard" titre={t("Message après l'échéance (retard)")} aide={t("Laissez vide pour garder le texte par défaut.")} initial={retard ?? ""} defaut={MODELE_RETARD_DEFAUT} />
    </div>
  );
}
