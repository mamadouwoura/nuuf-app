import { describe, expect, it } from "vitest";
import { erreurMotDePasse } from "@/lib/mot-de-passe";
import { decouper, numeroPage } from "@/components/Pagination";

describe("règles de mot de passe", () => {
  it("accepte un mot de passe correct", () => {
    expect(erreurMotDePasse("Terang2026sn")).toBeNull();
    expect(erreurMotDePasse("une phrase assez longue pour etre solide")).toBeNull();
  });
  it.each(["court1", "12345678", "password", "azertyui", "aaaaaaaaaa", "motdepasse1"])("refuse %s", (m) => {
    expect(erreurMotDePasse(m)).not.toBeNull();
  });
  it("refuse un mot de passe qui contient le numéro de téléphone", () => {
    expect(erreurMotDePasse("Abc771234567", "+221771234567")).toMatch(/téléphone/);
  });
  it("exige un mélange lettres/chiffres sauf phrase longue", () => {
    expect(erreurMotDePasse("seulementdeslettres")).toBeNull(); // 19 caractères : assez long
    expect(erreurMotDePasse("lettres")).not.toBeNull();
    expect(erreurMotDePasse("abcdefgh")).not.toBeNull();
  });
});

describe("pagination", () => {
  it("numéro de page toujours valide", () => {
    expect(numeroPage(undefined)).toBe(1);
    expect(numeroPage("abc")).toBe(1);
    expect(numeroPage("-5")).toBe(1);
    expect(numeroPage("3")).toBe(3);
    expect(numeroPage("999999999")).toBe(10_000);
  });
  it("découpe sans perte ni doublon", () => {
    const l = Array.from({ length: 60 }, (_, i) => i);
    const toutes = [1, 2, 3].flatMap((p) => decouper(l, p));
    expect(toutes).toEqual(l);
    expect(decouper(l, 4)).toEqual([]);
  });
});
