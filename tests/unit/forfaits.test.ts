import { describe, expect, it } from "vitest";
import { FORFAITS, prixAnnuel, prixMensuel } from "@/lib/forfaits";

describe("grille des forfaits", () => {
  it("prix fixes par forfait", () => {
    expect(prixMensuel("DECOUVERTE", 3)).toBe(0);
    expect(prixMensuel("BAILLEUR", 15)).toBe(10_000);
    expect(prixMensuel("PRO", 50)).toBe(25_000);
  });
  it("agence : 25 000 FCFA pour 50 logements puis 300 FCFA par logement supplémentaire", () => {
    expect(prixMensuel("AGENCE", 10)).toBe(25_000);
    expect(prixMensuel("AGENCE", 50)).toBe(25_000);
    expect(prixMensuel("AGENCE", 51)).toBe(25_300);
    expect(prixMensuel("AGENCE", 150)).toBe(25_000 + 100 * 300);
  });
  it("annuel = 10 mois payés pour 12", () => {
    expect(prixAnnuel("BAILLEUR", 10)).toBe(100_000);
    expect(prixAnnuel("AGENCE", 60)).toBe(10 * (25_000 + 10 * 300));
  });
  it("quotas d'accès par forfait", () => {
    expect(FORFAITS.BAILLEUR.acces).toBe(1);
    expect(FORFAITS.PRO.acces).toBe(5);
    expect(FORFAITS.AGENCE.acces).toBe(15);
    expect(FORFAITS.AGENCE.logements).toBe(Infinity);
  });
});
