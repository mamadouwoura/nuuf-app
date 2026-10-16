import { describe, expect, it } from "vitest";
import { joursDeRetard, taux, trancheDe } from "@/lib/stats";
import { prelevementAvance } from "@/lib/bilan";

describe("ancienneté des impayés", () => {
  it("compte les jours de retard après la date limite", () => {
    const limite = new Date("2026-10-05T00:00:00Z");
    expect(joursDeRetard(limite, new Date("2026-10-05T12:00:00Z"))).toBe(0);
    expect(joursDeRetard(limite, new Date("2026-10-06T00:00:00Z"))).toBe(1);
    expect(joursDeRetard(limite, new Date("2026-11-04T00:00:00Z"))).toBe(30);
    expect(joursDeRetard(limite, new Date("2026-10-01T00:00:00Z"))).toBe(0);
  });
  it("range un retard dans la bonne tranche", () => {
    expect(trancheDe(0)).toBeNull();
    expect(trancheDe(1)?.cle).toBe("0-30");
    expect(trancheDe(30)?.cle).toBe("0-30");
    expect(trancheDe(31)?.cle).toBe("31-60");
    expect(trancheDe(60)?.cle).toBe("31-60");
    expect(trancheDe(61)?.cle).toBe("61-90");
    expect(trancheDe(90)?.cle).toBe("61-90");
    expect(trancheDe(91)?.cle).toBe("90+");
    expect(trancheDe(900)?.cle).toBe("90+");
  });
  it("calcule un taux entier, 0 sans montant attendu", () => {
    expect(taux(0, 0)).toBe(0);
    expect(taux(150, 200)).toBe(75);
    expect(taux(1, 3)).toBe(33);
    expect(taux(200, 200)).toBe(100);
  });
});

describe("prélèvement d'une avance sur un bilan", () => {
  it("prend le reste dû quand le bilan le permet et qu'il n'y a pas de plafond mensuel", () => {
    expect(prelevementAvance(100_000, null, 500_000)).toBe(100_000);
  });
  it("respecte la mensualité prévue", () => {
    expect(prelevementAvance(100_000, 30_000, 500_000)).toBe(30_000);
    expect(prelevementAvance(20_000, 30_000, 500_000)).toBe(20_000);
  });
  it("ne rend jamais le net négatif", () => {
    expect(prelevementAvance(100_000, null, 40_000)).toBe(40_000);
    expect(prelevementAvance(100_000, 30_000, 10_000)).toBe(10_000);
    expect(prelevementAvance(100_000, null, 0)).toBe(0);
    expect(prelevementAvance(100_000, null, -5_000)).toBe(0);
  });
  it("ne prélève rien quand l'avance est soldée", () => {
    expect(prelevementAvance(0, 30_000, 500_000)).toBe(0);
  });
});
