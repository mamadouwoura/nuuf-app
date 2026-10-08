"use server";

import { cookies } from "next/headers";
import { COOKIE_LANGUE, estLocale } from "@/lib/i18n/config";

/** Mémorise la langue choisie (un an). La page courante est ré-affichée automatiquement dans la nouvelle langue. */
export async function changerLangue(locale: string) {
  if (!estLocale(locale)) return;
  (await cookies()).set(COOKIE_LANGUE, locale, {
    maxAge: 365 * 86_400,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
