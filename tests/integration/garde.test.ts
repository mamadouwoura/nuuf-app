import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { plafondCodesAtteint, tropDEchecsCode } from "@/lib/garde";
import { baseDeTest } from "./aide";

const utilisateurs: string[] = [];
afterAll(async () => {
  await db.utilisateur.deleteMany({ where: { id: { in: utilisateurs } } });
  await db.message.deleteMany({ where: { destinataire: "+221700099999" } });
  await db.$disconnect();
});

async function creerUtilisateur() {
  const id = `garde${Math.random().toString(36).slice(2, 9)}`;
  await db.utilisateur.create({ data: { id, telephone: `+22170${Math.floor(1_000_000 + Math.random() * 8_999_999)}`, nomComplet: "Test garde", motDePasse: "x:y" } });
  utilisateurs.push(id);
  return id;
}
const code = (utilisateurId: string, tentatives: number) =>
  db.codeOtp.create({ data: { utilisateurId, codeHash: "h", expireLe: new Date(Date.now() + 600_000), tentatives } });

describe.skipIf(!baseDeTest)("garde-fous anti-abus", () => {
  it("bloque après 10 essais faux sur la dernière heure, tous codes confondus", async () => {
    const u = await creerUtilisateur();
    await code(u, 5);
    expect(await tropDEchecsCode(u)).toBe(false);
    await code(u, 5); // un second code consommé : 5 + 5 essais
    expect(await tropDEchecsCode(u)).toBe(true);
  });
  it("n'est pas déclenché pour un autre compte", async () => {
    const a = await creerUtilisateur();
    const b = await creerUtilisateur();
    await code(a, 5);
    await code(a, 5);
    expect(await tropDEchecsCode(a)).toBe(true);
    expect(await tropDEchecsCode(b)).toBe(false);
  });
  it("plafond global de codes envoyés par heure", async () => {
    const avant = process.env.OTP_MAX_PAR_HEURE;
    const n = await db.message.count({ where: { type: "OTP", creeLe: { gte: new Date(Date.now() - 3_600_000) } } });
    process.env.OTP_MAX_PAR_HEURE = String(n + 2);
    expect(await plafondCodesAtteint()).toBe(false);
    await db.message.createMany({ data: [1, 2].map(() => ({ canal: "WHATSAPP" as const, type: "OTP" as const, destinataire: "+221700099999" })) });
    expect(await plafondCodesAtteint()).toBe(true);
    if (avant === undefined) delete process.env.OTP_MAX_PAR_HEURE;
    else process.env.OTP_MAX_PAR_HEURE = avant;
  });
});
