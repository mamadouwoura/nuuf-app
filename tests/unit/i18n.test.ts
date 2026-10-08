import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { estLocale, localeDepuisEntete } from "@/lib/i18n/config";
import { formaterDate, moisAnnee, moisCourt, nomMois } from "@/lib/i18n/format";
import { creerTraducteur } from "@/lib/i18n/translate";
import en from "@/lib/i18n/dictionaries/en.json";

const require = createRequire(import.meta.url);
const { extraire, tri, CLIENT } = require("../../scripts/i18n-extraire.cjs") as typeof import("../../scripts/i18n-extraire.cjs");
import { readFileSync } from "node:fs";

const dict = en as Record<string, string>;
const variables = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("traducteur", () => {
  const fr = creerTraducteur("fr");
  const ang = creerTraducteur("en", { Bonjour: "Hello", "Bonjour {prenom}": "Hello {prenom}" });

  it("le français renvoie le texte source, variables remplacées", () => {
    expect(fr.t("Bonjour {prenom}", { prenom: "Awa" })).toBe("Bonjour Awa");
  });
  it("l'anglais traduit, remplace les variables et retombe sur le français si la clé manque", () => {
    expect(ang.t("Bonjour")).toBe("Hello");
    expect(ang.t("Bonjour {prenom}", { prenom: "Awa" })).toBe("Hello Awa");
    expect(ang.t("Texte inconnu")).toBe("Texte inconnu");
  });
  it("variable absente : le marqueur reste visible plutôt que de disparaître", () => {
    expect(fr.t("Salut {nom}")).toBe("Salut {nom}");
  });
  it("pluriel : 0 et 1 sont singuliers en français, seul 1 l'est en anglais", () => {
    const t = (l: "fr" | "en", n: number) => creerTraducteur(l, { "{n} loyer": "{n} rent", "{n} loyers": "{n} rents" }).tn(n, "{n} loyer", "{n} loyers");
    expect(t("fr", 0)).toBe("0 loyer");
    expect(t("fr", 1)).toBe("1 loyer");
    expect(t("fr", 2)).toBe("2 loyers");
    expect(t("en", 0)).toBe("0 rents");
    expect(t("en", 1)).toBe("1 rent");
    expect(t("en", 2)).toBe("2 rents");
  });
});

describe("choix de la langue", () => {
  it("reconnaît les langues prises en charge", () => {
    expect(estLocale("fr")).toBe(true);
    expect(estLocale("en")).toBe(true);
    expect(estLocale("wo")).toBe(false);
    expect(estLocale(undefined)).toBe(false);
  });
  it.each([
    ["en-US,en;q=0.9", "en"],
    ["fr-FR,fr;q=0.9,en;q=0.8", "fr"],
    ["en;q=0.8,fr;q=0.9", "en"], // première langue listée reconnue
    ["de-DE,de;q=0.9", "fr"],
    ["", "fr"],
    [null, "fr"],
  ])("Accept-Language %s → %s", (entete, attendu) => {
    expect(localeDepuisEntete(entete as string | null)).toBe(attendu);
  });
});

describe("dates et mois", () => {
  const d = new Date(Date.UTC(2026, 9, 8));
  it("noms de mois dans chaque langue", () => {
    expect(nomMois(d, "fr")).toBe("octobre");
    expect(nomMois(d, "en")).toBe("October");
    expect(moisAnnee(d, "fr")).toBe("Octobre 2026");
    expect(moisAnnee(d, "en")).toBe("October 2026");
    expect(moisCourt(new Date(Date.UTC(2026, 7, 1)), "fr")).toBe("Août");
    expect(moisCourt(new Date(Date.UTC(2026, 7, 1)), "en")).toBe("Aug");
  });
  it("date longue selon la langue", () => {
    expect(formaterDate(d, "fr")).toContain("octobre");
    expect(formaterDate(d, "en")).toContain("October");
  });
});

describe("complétude du dictionnaire anglais", () => {
  const cles = extraire();
  it("toutes les clés utilisées dans le code ont une traduction", () => {
    const manquantes = [...cles.keys()].filter((k) => !dict[k]);
    expect(manquantes).toEqual([]);
  });
  it("aucune traduction orpheline (clé qui n'existe plus dans le code)", () => {
    expect(Object.keys(dict).filter((k) => !cles.has(k))).toEqual([]);
  });
  it("chaque traduction garde exactement les mêmes variables {…} que le texte français", () => {
    const erreurs = Object.entries(dict).filter(([k, v]) => variables(k).join() !== variables(v).join()).map(([k]) => k);
    expect(erreurs).toEqual([]);
  });
  it("la liste des clés envoyées aux composants client est à jour (npm run i18n:cles)", () => {
    const attendu = JSON.stringify(tri(extraire(true).keys()), null, 1) + "\n";
    expect(readFileSync(CLIENT, "utf8")).toBe(attendu);
  });
});
