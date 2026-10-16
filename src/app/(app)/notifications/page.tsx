import Chargement from "@/components/Chargement";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ouvrirNotification, toutLire } from "@/app/actions/notifications";
import { db } from "@/lib/db";
import { ICONE } from "@/lib/notifications";
import { formaterDate } from "@/lib/i18n/format";
import { getUser } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Notifications")) };
}

async function Contenu() {
  const { t, tn, locale } = await getT();
  const user = await getUser();
  if (!user) redirect("/connexion");
  const [liste, nonLues] = await Promise.all([
    db.notification.findMany({ where: { utilisateurId: user.id }, orderBy: { creeLe: "desc" }, take: 60 }),
    db.notification.count({ where: { utilisateurId: user.id, luLe: null } }),
  ]);
  const vars = (d: unknown) => (d && typeof d === "object" ? (d as Record<string, string | number>) : undefined);

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Notifications")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {nonLues > 0 ? tn(nonLues, "{n} notification non lue.", "{n} notifications non lues.") : t("Vous êtes à jour.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications/preferences" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            {t("Préférences")}
          </Link>
          {nonLues > 0 && (
            <form action={toutLire}>
              <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                {t("Tout marquer comme lu")}
              </button>
            </form>
          )}
        </div>
      </div>

      {liste.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">notifications_none</span>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("Aucune notification pour le moment.")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {liste.map((n) => (
            <li key={n.id}>
              <form action={ouvrirNotification}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="lien" value={n.lien ?? "/notifications"} />
                <button className={`w-full text-left flex items-start gap-3 rounded-xl p-3 transition-colors ${n.luLe ? "bg-surface-container-lowest" : "bg-secondary-fixed/50 hover:bg-secondary-fixed"}`}>
                  <span className="shrink-0 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">{ICONE[n.categorie] ?? "notifications"}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-label-lg text-label-lg ${n.luLe ? "text-on-surface" : "text-on-surface font-bold"}`}>{t(n.titre, vars(n.donnees))}</span>
                    {n.texte && <span className="block font-body-md text-body-md text-on-surface-variant">{t(n.texte, vars(n.donnees))}</span>}
                    <span className="block font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {formaterDate(n.creeLe, locale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  {!n.luLe && <span aria-label={t("Non lue")} className="shrink-0 mt-2 w-2.5 h-2.5 rounded-full bg-primary" />}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Chargement />}>
      <Contenu />
    </Suspense>
  );
}
