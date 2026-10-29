"use client";

import Link from "next/link";
import { useState } from "react";
import { FORFAITS, prixAnnuel, prixMensuel } from "@/lib/forfaits";
import { useT } from "@/lib/i18n/client";

type Profil = "PARTICULIER" | "AGENCE";
type Code = "BAILLEUR" | "PRO" | "AGENCE";
const nombre = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ");

/** Forfait conseillé : particulier jusqu'à 15 logements → Bailleur, jusqu'à 50 → Pro ; agence ou plus de 50 logements → Agence. */
export function forfaitConseille(profil: Profil, logements: number): Code {
  if (profil === "AGENCE" || logements > 50) return "AGENCE";
  return logements <= 15 ? "BAILLEUR" : "PRO";
}

/** « Est-ce que ça marche pour mon parc ? » : deux champs, une réponse immédiate avec le forfait et son prix. */
export default function TestGratuit() {
  const { t } = useT();
  const [profil, setProfil] = useState<Profil>("PARTICULIER");
  const [logements, setLogements] = useState("8");
  const [etat, setEtat] = useState<"attente" | "calcul" | "resultat">("attente");
  const [reponse, setReponse] = useState<{ code: Code; n: number } | null>(null);

  const n = Math.min(9999, Math.max(1, Math.floor(Number(logements.replace(/\D/g, ""))) || 0));
  const valide = Number(logements.replace(/\D/g, "")) >= 1;

  function verifier(profilCible = profil, nbCible = n) {
    if (nbCible < 1) return;
    setEtat("calcul");
    window.setTimeout(() => {
      setReponse({ code: forfaitConseille(profilCible, nbCible), n: nbCible });
      setEtat("resultat");
    }, 650);
  }
  function exemple(p: Profil, nb: number) {
    setProfil(p);
    setLogements(String(nb));
    verifier(p, nb);
  }

  const champ = "h-14 w-full rounded-2xl bg-surface-container-lowest px-5 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/60 ring-1 ring-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container";
  const choix = (actif: boolean) => `h-14 flex-1 rounded-2xl px-4 font-label-lg text-label-lg font-semibold transition-colors ${actif ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest text-on-surface-variant ring-1 ring-outline-variant/60 hover:text-on-surface"}`;

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[2rem] bg-surface-container-low p-5 sm:p-8 ring-1 ring-outline-variant/50">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifier();
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-3" role="group" aria-label={t("Votre profil")}>
          <button type="button" aria-pressed={profil === "PARTICULIER"} onClick={() => setProfil("PARTICULIER")} className={choix(profil === "PARTICULIER")}>{t("Bailleur particulier")}</button>
          <button type="button" aria-pressed={profil === "AGENCE"} onClick={() => setProfil("AGENCE")} className={choix(profil === "AGENCE")}>{t("Agence immobilière")}</button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">{t("Nombre de logements")}</span>
            <input
              value={logements}
              onChange={(e) => {
                setLogements(e.target.value.replace(/\D/g, "").slice(0, 4));
                setEtat("attente");
              }}
              inputMode="numeric"
              placeholder={t("Nombre de logements")}
              className={champ}
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            disabled={!valide || etat === "calcul"}
            className="h-14 rounded-2xl bg-[#082d23] px-8 font-label-lg text-label-lg font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50 sm:min-w-44"
          >
            {etat === "calcul" ? <span className="nf-tourne inline-block size-5 rounded-full border-2 border-white/30 border-t-white align-middle" aria-hidden="true" /> : t("Vérifier")}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
        <span>{t("Exemples :")}</span>
        {([[ "PARTICULIER", 5 ], [ "PARTICULIER", 30 ], [ "AGENCE", 80 ]] as [Profil, number][]).map(([p, nb]) => (
          <button key={`${p}${nb}`} type="button" onClick={() => exemple(p, nb)} className="rounded-full bg-surface-container-lowest px-3.5 py-1.5 font-label-md text-label-md ring-1 ring-outline-variant/60 transition-colors hover:text-primary">
            {p === "AGENCE" ? t("Agence") : t("Particulier")} · {nb} {t("logements")}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-5 min-h-4">
        {etat === "resultat" && reponse && (
          <div key={`${reponse.code}${reponse.n}`} className="nf-pop flex flex-col gap-4 rounded-3xl bg-surface-container-lowest p-5 ring-1 ring-primary-container/40 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-success-container px-3 py-1 font-label-md text-label-md font-bold text-on-success-container">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {t("Oui, Nuuf convient à votre parc")}
              </p>
              <p className="mt-2 font-headline-sm text-headline-sm font-bold text-on-surface">
                {t("Forfait conseillé")} : {t(FORFAITS[reponse.code].nom)}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {nombre(prixMensuel(reponse.code, reponse.n))} FCFA / {t("mois")} · {nombre(prixAnnuel(reponse.code, reponse.n))} FCFA / {t("an")}
              </p>
            </div>
            <Link href="/inscription" className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary-container px-6 font-label-lg text-label-lg font-bold text-on-primary hover:bg-primary">
              {t("Essayer 14 jours")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
