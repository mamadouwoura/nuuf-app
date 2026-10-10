import { describe, expect, it } from "vitest";
import { generateOtp, hashOtp, hashPassword, normalizePhone, sign, verify, verifyPassword } from "@/lib/security";

describe("numéros de téléphone", () => {
  it.each([
    ["77 123 45 67", "+221771234567"],
    ["+221 77 123 45 67", "+221771234567"],
    ["00221771234567", "+221771234567"],
    ["771234567", "+221771234567"],
  ])("normalise %s", (entree, attendu) => {
    expect(normalizePhone(entree)).toBe(attendu);
  });
  it.each(["", "12345", "87 123 45 67", "+33 6 12 34 56 78", "77 123 45 6", "abc"])("refuse %s", (entree) => {
    expect(normalizePhone(entree)).toBeNull();
  });
});

describe("mots de passe", () => {
  it("vérifie le bon mot de passe et refuse les autres", async () => {
    const h = await hashPassword("MotDePasse-Correct1");
    expect(await verifyPassword("MotDePasse-Correct1", h)).toBe(true);
    expect(await verifyPassword("mauvais", h)).toBe(false);
  });
  it("deux hachages du même mot de passe diffèrent (sel aléatoire)", async () => {
    expect(await hashPassword("abc12345")).not.toBe(await hashPassword("abc12345"));
  });
});

describe("codes à usage unique", () => {
  it("6 chiffres", () => {
    for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/);
  });
  it("le haché ne contient pas le code", () => {
    expect(hashOtp("123456")).not.toContain("123456");
    expect(hashOtp("123456")).toBe(hashOtp("123456"));
  });
});

describe("jetons signés", () => {
  it("accepte un jeton valide", () => {
    const t = sign({ uid: "u1", exp: Date.now() + 60_000 });
    expect(verify<{ uid: string }>(t)?.uid).toBe("u1");
  });
  it("refuse un jeton expiré", () => {
    expect(verify(sign({ uid: "u1", exp: Date.now() - 1 }))).toBeNull();
  });
  it("refuse un jeton falsifié", () => {
    const t = sign({ uid: "u1", exp: Date.now() + 60_000 });
    const [corps, sig] = t.split(".");
    const faux = Buffer.from(JSON.stringify({ uid: "admin", exp: Date.now() + 60_000 })).toString("base64url");
    expect(verify(`${faux}.${sig}`)).toBeNull();
    expect(verify(`${corps}.x${sig.slice(1)}`)).toBeNull();
    expect(verify("nimporte quoi")).toBeNull();
    expect(verify(undefined)).toBeNull();
  });
});
