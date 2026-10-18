import type { Abonnement } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { etatAcces, finApresPaiement, prolonger } from "@/lib/abonnement";

const JOUR = 86_400_000;
const now = new Date("2026-10-08T12:00:00Z");
const dans = (j: number) => new Date(now.getTime() + j * JOUR);
const abo = (p: Partial<Abonnement>) => p as Abonnement;

describe("état d'accès", () => {
  it("pas d'abonnement : lecture seule", () => {
    expect(etatAcces(null, now).ecriture).toBe(false);
  });
  it("essai en cours : écriture autorisée avec jours restants", () => {
    const e = etatAcces(abo({ statut: "ESSAI", essaiFinLe: dans(10) }), now);
    expect(e).toMatchObject({ etat: "ESSAI", ecriture: true, joursRestants: 10 });
  });
  it("essai terminé : lecture seule", () => {
    const e = etatAcces(abo({ statut: "ESSAI", essaiFinLe: dans(-1) }), now);
    expect(e).toMatchObject({ etat: "ESSAI_TERMINE", ecriture: false });
  });
  it("abonnement payé en cours : actif", () => {
    expect(etatAcces(abo({ statut: "ACTIF", periodeFinLe: dans(5) }), now).etat).toBe("ACTIF");
  });
  it("échu depuis moins de 7 jours : période de grâce, écriture encore permise", () => {
    const e = etatAcces(abo({ statut: "ACTIF", periodeFinLe: dans(-3) }), now);
    expect(e).toMatchObject({ etat: "GRACE", ecriture: true, joursRestants: 4 });
  });
  it("échu depuis plus de 7 jours : lecture seule", () => {
    const e = etatAcces(abo({ statut: "ACTIF", periodeFinLe: dans(-8) }), now);
    expect(e).toMatchObject({ etat: "LECTURE_SEULE", ecriture: false });
  });
  it("résilié : accès jusqu'à la fin de la période payée, puis lecture seule", () => {
    expect(etatAcces(abo({ statut: "RESILIE", periodeFinLe: dans(3) }), now).ecriture).toBe(true);
    expect(etatAcces(abo({ statut: "RESILIE", periodeFinLe: dans(-1) }), now).ecriture).toBe(false);
  });
});

describe("prolongation et prorata", () => {
  it("renouvellement : on prolonge depuis la fin actuelle, sans perdre de jours", () => {
    const r = prolonger({ periodeFinLe: dans(10) }, false, now);
    expect(r.toISOString()).toBe(new Date(Date.UTC(2026, 10, 18, 12)).toISOString());
  });
  it("période dépassée : on repart d'aujourd'hui", () => {
    const r = prolonger({ periodeFinLe: dans(-20) }, true, now);
    expect(r.toISOString()).toBe(new Date(Date.UTC(2027, 9, 8, 12)).toISOString());
  });
  it("même forfait, même périodicité : renouvellement simple", () => {
    const a = abo({ forfait: "BAILLEUR", annuel: false, statut: "ACTIF", periodeFinLe: dans(10) });
    const r = finApresPaiement(a, { forfait: "BAILLEUR", annuel: false, nbLogements: 5 }, now);
    expect(r.getTime()).toBe(prolonger(a, false, now).getTime());
  });
  it("passage en forfait plus cher : le temps déjà payé est converti au prorata", () => {
    // 30 jours restants à 9 900/mois valent 30 * 9 900/24 900 jours de forfait Pro à 24 900/mois.
    const a = abo({ forfait: "BAILLEUR", annuel: false, statut: "ACTIF", periodeFinLe: dans(30) });
    const r = finApresPaiement(a, { forfait: "PRO", annuel: false, nbLogements: 20 }, now);
    const finMois = new Date(now);
    finMois.setUTCMonth(finMois.getUTCMonth() + 1);
    expect((r.getTime() - finMois.getTime()) / JOUR).toBeCloseTo((30 * 9_900) / 24_900, 5);
  });
  it("sortie d'essai : la nouvelle période démarre aujourd'hui", () => {
    const a = abo({ forfait: "DECOUVERTE", annuel: false, statut: "ESSAI", periodeFinLe: null });
    const r = finApresPaiement(a, { forfait: "BAILLEUR", annuel: false, nbLogements: 3 }, now);
    expect(r.toISOString()).toBe(new Date(Date.UTC(2026, 10, 8, 12)).toISOString());
  });
});
