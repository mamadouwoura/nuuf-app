"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";

/**
 * Demande de démonstration : prépare un message WhatsApp déjà rédigé (rien n'est stocké sur nos serveurs).
 * Sans numéro WhatsApp configuré, le bouton propose l'e-mail ; sans les deux, il l'indique clairement.
 */
export default function DemoFormulaire({ whatsapp, email }: { whatsapp?: string; email?: string }) {
  const { t } = useT();
  const [prenom, setPrenom] = useState("");
  const [activite, setActivite] = useState("");
  const [telephone, setTelephone] = useState("");

  const message = t("Bonjour, je souhaite une démonstration de 15 minutes de Nuuf. Prénom : {prenom}. Activité : {activite}. Téléphone : {telephone}.", {
    prenom: prenom || "—",
    activite: activite || "—",
    telephone: telephone || "—",
  });
  const lien = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : email
      ? `mailto:${email}?subject=${encodeURIComponent(t("Demande de démonstration Nuuf"))}&body=${encodeURIComponent(message)}`
      : null;
  const pret = prenom.trim().length >= 2 && activite.trim().length >= 2;

  const champ = "h-14 w-full rounded-2xl bg-surface-container-lowest px-5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 ring-1 ring-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container";
  return (
    <div className="flex flex-col gap-3">
      <input value={prenom} onChange={(e) => setPrenom(e.target.value.slice(0, 60))} placeholder={t("Prénom")} className={champ} autoComplete="given-name" aria-label={t("Prénom")} />
      <input value={activite} onChange={(e) => setActivite(e.target.value.slice(0, 80))} placeholder={t("Votre activité ou votre agence")} className={champ} aria-label={t("Votre activité ou votre agence")} />
      <input value={telephone} onChange={(e) => setTelephone(e.target.value.replace(/[^\d+\s]/g, "").slice(0, 20))} inputMode="tel" placeholder={t("Téléphone (facultatif)")} className={champ} autoComplete="tel" aria-label={t("Téléphone (facultatif)")} />
      {lien ? (
        <a
          href={pret ? lien : undefined}
          target="_blank"
          rel="noopener"
          aria-disabled={!pret}
          className={`nf-lueur inline-flex h-14 items-center justify-center rounded-full bg-[#082d23] px-8 font-label-lg text-label-lg font-bold text-white transition-transform active:scale-[0.98] ${pret ? "" : "pointer-events-none opacity-50"}`}
        >
          {t("Je réserve ma démo")}
        </a>
      ) : (
        <p className="rounded-2xl bg-secondary-fixed px-4 py-3 font-body-sm text-body-sm text-on-secondary-fixed">{t("Le contact de démonstration n'est pas encore configuré.")}</p>
      )}
      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">{t("Gratuit · en visio ou chez vous · sans engagement")}</p>
    </div>
  );
}
