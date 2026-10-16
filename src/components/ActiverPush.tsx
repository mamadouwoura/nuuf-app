"use client";

import { useEffect, useState } from "react";
import { enregistrerPush, retirerPush, testerPush } from "@/app/actions/push";
import { useT } from "@/lib/i18n/client";

type Etat = "chargement" | "indisponible" | "refuse" | "inactif" | "actif";

const versUint8 = (base64url: string) => {
  const b = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(b);
  return Uint8Array.from(brut, (c) => c.charCodeAt(0));
};

const nomAppareil = () => {
  const ua = navigator.userAgent;
  const systeme = /iPhone|iPad/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : "Appareil";
  const navigateur = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "navigateur";
  return `${systeme} · ${navigateur}`;
};

/** Active les notifications push sur cet appareil (navigateur ou application installée). */
export default function ActiverPush({ clePublique }: { clePublique: string | null }) {
  const { t } = useT();
  const [etat, setEtat] = useState<Etat>("chargement");
  const [message, setMessage] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      if (!clePublique || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!annule) setEtat("indisponible");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (annule) return;
        setEtat(Notification.permission === "denied" ? "refuse" : sub ? "actif" : "inactif");
      } catch {
        if (!annule) setEtat("indisponible");
      }
    })();
    return () => {
      annule = true;
    };
  }, [clePublique]);

  async function activer() {
    if (!clePublique) return;
    setOccupe(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat("refuse");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: versUint8(clePublique) }));
      const json = sub.toJSON();
      const r = await enregistrerPush({ endpoint: sub.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } }, nomAppareil());
      if (r.ok) setEtat("actif");
      else {
        await sub.unsubscribe().catch(() => {});
        setMessage(r.erreur ?? t("Activation impossible."));
      }
    } catch {
      setMessage(t("Activation impossible sur cet appareil."));
    } finally {
      setOccupe(false);
    }
  }

  async function desactiver() {
    setOccupe(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await retirerPush(sub.endpoint);
        await sub.unsubscribe();
      }
      setEtat("inactif");
    } finally {
      setOccupe(false);
    }
  }

  async function tester() {
    setOccupe(true);
    setMessage(null);
    const r = await testerPush();
    setMessage(r.ok ? t("Notification de test envoyée.") : (r.erreur ?? t("Échec de l'envoi.")));
    setOccupe(false);
  }

  const bouton = "h-11 px-space-lg rounded-xl font-label-lg text-label-lg font-bold disabled:opacity-60";

  return (
    <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md">
      <h3 className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
        {t("Notifications sur cet appareil")}
      </h3>
      {etat === "chargement" && <p className="font-body-md text-body-md text-on-surface-variant">{t("Vérification…")}</p>}
      {etat === "indisponible" && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {clePublique
            ? t("Cet appareil ne gère pas les notifications push. Sur iPhone, ajoutez d'abord Nuuf à l'écran d'accueil.")
            : t("Les notifications push ne sont pas encore activées sur ce serveur.")}
        </p>
      )}
      {etat === "refuse" && <p className="font-body-md text-body-md text-on-surface-variant">{t("Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis revenez ici.")}</p>}
      {etat === "inactif" && (
        <>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Recevez une alerte sur cet appareil à chaque paiement ou événement important, même lorsque Nuuf est fermé.")}</p>
          <button type="button" disabled={occupe} onClick={activer} className={`${bouton} self-start bg-primary text-on-primary`}>{t("Activer sur cet appareil")}</button>
        </>
      )}
      {etat === "actif" && (
        <div className="flex flex-col gap-space-sm">
          <p className="font-body-md text-body-md text-on-surface">
            <span className="material-symbols-outlined align-middle text-primary text-[20px]">check_circle</span> {t("Activées sur cet appareil.")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={occupe} onClick={tester} className={`${bouton} bg-surface-container text-primary`}>{t("Envoyer un test")}</button>
            <button type="button" disabled={occupe} onClick={desactiver} className={`${bouton} bg-surface-container text-error`}>{t("Désactiver")}</button>
          </div>
        </div>
      )}
      {message && <p role="status" className="font-body-md text-body-md text-on-surface">{message}</p>}
    </div>
  );
}
