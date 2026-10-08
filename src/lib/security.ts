import { createHash, createHmac, randomInt, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Clé de signature des sessions : obligatoire, 32 caractères minimum (jamais de valeur par défaut). */
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum).");
  return s;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export const generateOtp = () => String(randomInt(0, 1_000_000)).padStart(6, "0");
export const hashOtp = (code: string) => createHash("sha256").update(code + secret()).digest("hex");

/** Jeton signé : base64url(payload).signature */
export function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${createHmac("sha256", secret()).update(body).digest("base64url")}`;
}

export function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp?: number };
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** Numéro sénégalais -> +221XXXXXXXXX, ou null si invalide. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^(00)?221/, "");
  return /^7[0-9]{8}$/.test(digits) ? `+221${digits}` : null;
}
