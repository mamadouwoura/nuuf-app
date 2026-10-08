import { describe, expect, it } from "vitest";
import { declencheurDu } from "@/lib/relances-auto";
import { cleMois, depuisCle } from "@/lib/loyers";

const tout = { avantEcheance: true, apresJ1: true, apresJ5: true };

describe("déclencheurs de relance", () => {
  it("rappel avant l'échéance dans les 3 derniers jours", () => {
    expect(declencheurDu(-3, tout)).toBe("J-3");
    expect(declencheurDu(-1, tout)).toBe("J-3");
    expect(declencheurDu(-4, tout)).toBeNull();
    expect(declencheurDu(0, tout)).toBeNull();
  });
  it("retard de 1 à 4 jours : J+1 ; à partir de 5 jours : J+5", () => {
    expect(declencheurDu(1, tout)).toBe("J+1");
    expect(declencheurDu(4, tout)).toBe("J+1");
    expect(declencheurDu(5, tout)).toBe("J+5");
    expect(declencheurDu(40, tout)).toBe("J+5");
  });
  it("respecte les réglages de chaque bailleur", () => {
    expect(declencheurDu(-2, { ...tout, avantEcheance: false })).toBeNull();
    expect(declencheurDu(2, { ...tout, apresJ1: false })).toBeNull();
    expect(declencheurDu(7, { ...tout, apresJ5: false })).toBeNull();
  });
});

describe("mois", () => {
  it("clé et décodage", () => {
    expect(cleMois(new Date(Date.UTC(2026, 9, 15)))).toBe("2026-10");
    expect(depuisCle("2026-03", new Date()).toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });
  it("clé invalide : mois courant", () => {
    expect(cleMois(depuisCle("nimporte quoi", new Date(Date.UTC(2026, 9, 20))))).toBe("2026-10");
  });
});
