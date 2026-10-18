import { describe, expect, it } from "vitest";
import { FORFAITS, prixAnnuel, prixMensuel } from "@/lib/forfaits";

describe("grille des forfaits", () => {
  it("prix fixes par forfait", () => {
    expect(prixMensuel("DECOUVERTE", 3)).toBe(0);
    expect(prixMensuel("BAILLEUR", 15)).toBe(9_900);
    expect(prixMensuel("PRO", 50)).toBe(24_900);
  });
  it("agence : 14 900 FCFA jusqu'à 20 logements, 24 900 FCFA jusqu'à 50, puis 300 FCFA par logement", () => {
    expect(prixMensuel("AGENCE", 0)).toBe(14_900);
    expect(prixMensuel("AGENCE", 10)).toBe(14_900);
    expect(prixMensuel("AGENCE", 20)).toBe(14_900);
    expect(prixMensuel("AGENCE", 21)).toBe(24_900);
    expect(prixMensuel("AGENCE", 50)).toBe(24_900);
    expect(prixMensuel("AGENCE", 51)).toBe(25_200);
    expect(prixMensuel("AGENCE", 150)).toBe(24_900 + 100 * 300);
  });
  it("annuel = 10 mois payés pour 12", () => {
    expect(prixAnnuel("BAILLEUR", 10)).toBe(99_000);
    expect(prixAnnuel("AGENCE", 60)).toBe(10 * (24_900 + 10 * 300));
  });
  it("quotas d'accès par forfait", () => {
    expect(FORFAITS.BAILLEUR.acces).toBe(1);
    expect(FORFAITS.PRO.acces).toBe(5);
    expect(FORFAITS.AGENCE.acces).toBe(15);
    expect(FORFAITS.AGENCE.logements).toBe(Infinity);
  });
});
