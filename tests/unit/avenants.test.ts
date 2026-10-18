import { describe, expect, it } from "vitest";
import { analyserAvenant, dateStricte } from "@/lib/avenants";

const now = new Date(Date.UTC(2026, 9, 18, 12));
const bail = { loyerMensuel: 100_000, debutLe: new Date(Date.UTC(2026, 0, 1)), finLe: null as Date | null };

describe("avenant : changement de loyer", () => {
  it("accepte un nouveau loyer pour ce mois ou le mois prochain", () => {
    const a = analyserAvenant({ type: "LOYER", loyer: 120_000, effet: "courant" }, bail, now);
    expect(a).toMatchObject({ ok: true, avenant: { type: "LOYER", ancienLoyer: 100_000, nouveauLoyer: 120_000 } });
    expect(a.ok && a.avenant.effetLe.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    const b = analyserAvenant({ type: "LOYER", loyer: 90_000, effet: "suivant" }, bail, now);
    expect(b.ok && b.avenant.effetLe.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });
  it("passe correctement le 31 décembre au 1er janvier suivant", () => {
    const a = analyserAvenant({ type: "LOYER", loyer: 110_000, effet: "suivant" }, bail, new Date(Date.UTC(2026, 11, 31)));
    expect(a.ok && a.avenant.effetLe.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
  it("refuse un loyer vide, nul, identique, démesuré ou un effet inconnu", () => {
    for (const loyer of [0, NaN, -5, 100_000, 100_000_001]) {
      expect(analyserAvenant({ type: "LOYER", loyer, effet: "courant" }, bail, now).ok).toBe(false);
    }
    expect(analyserAvenant({ type: "LOYER", loyer: 120_000, effet: "hier" }, bail, now).ok).toBe(false);
    expect(analyserAvenant({ type: "LOYER", loyer: 120_000 }, bail, now).ok).toBe(false);
  });
});

describe("avenant : durée", () => {
  it("accepte une date de fin future et retient l'ancienne", () => {
    const fin = new Date(Date.UTC(2027, 5, 30));
    const a = analyserAvenant({ type: "DUREE", finLe: "2027-06-30" }, { ...bail, finLe: new Date(Date.UTC(2026, 11, 31)) }, now);
    expect(a).toMatchObject({ ok: true, avenant: { type: "DUREE", ancienneFinLe: new Date(Date.UTC(2026, 11, 31)) } });
    expect(a.ok && a.avenant.nouvelleFinLe?.getTime()).toBe(fin.getTime());
  });
  it("refuse une date passée, antérieure au début, inchangée, lointaine ou mal formée", () => {
    const f = (finLe: string | undefined, b = bail) => analyserAvenant({ type: "DUREE", finLe }, b, now).ok;
    expect(f("2026-10-01")).toBe(false);
    expect(f("2025-12-31")).toBe(false);
    expect(f("2027-02-30")).toBe(false);
    expect(f("30/06/2027")).toBe(false);
    expect(f(undefined)).toBe(false);
    expect(f("2099-01-01")).toBe(false);
    expect(f("2027-06-30", { ...bail, finLe: new Date(Date.UTC(2027, 5, 30)) })).toBe(false);
  });
  it("aujourd'hui est accepté comme date de fin", () => {
    expect(analyserAvenant({ type: "DUREE", finLe: "2026-10-18" }, bail, now).ok).toBe(true);
  });
});

describe("avenant : clause", () => {
  it("normalise les espaces et borne la longueur", () => {
    const a = analyserAvenant({ type: "CLAUSE", clause: "  Le  locataire   peut garder un animal. " }, bail, now);
    expect(a.ok && a.avenant.clause).toBe("Le locataire peut garder un animal.");
    expect(analyserAvenant({ type: "CLAUSE", clause: "court" }, bail, now).ok).toBe(false);
    expect(analyserAvenant({ type: "CLAUSE", clause: "x".repeat(1001) }, bail, now).ok).toBe(false);
    expect(analyserAvenant({ type: "CLAUSE", clause: "x".repeat(1000) }, bail, now).ok).toBe(true);
  });
  it("un type inconnu est refusé", () => {
    expect(analyserAvenant({ type: "AUTRE" }, bail, now).ok).toBe(false);
  });
});

describe("dateStricte", () => {
  it("n'accepte que des dates réelles AAAA-MM-JJ", () => {
    expect(dateStricte("2026-02-28")?.toISOString()).toBe("2026-02-28T00:00:00.000Z");
    expect(dateStricte("2026-02-29")).toBeNull();
    expect(dateStricte("2024-02-29")).not.toBeNull();
    expect(dateStricte("2026-13-01")).toBeNull();
    expect(dateStricte("")).toBeNull();
    expect(dateStricte("2026-1-1")).toBeNull();
  });
});
