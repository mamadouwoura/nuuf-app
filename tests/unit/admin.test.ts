import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/session", () => ({ getUser: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));

import { estAdmin, numerosAdmin } from "@/lib/admin";

describe("reconnaissance de l'administrateur", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("reconnaît uniquement les numéros listés dans ADMIN_PHONES", () => {
    vi.stubEnv("ADMIN_PHONES", "+221778652991, +221771111111");
    expect(numerosAdmin()).toEqual(["+221778652991", "+221771111111"]);
    expect(estAdmin("+221778652991")).toBe(true);
    expect(estAdmin("+221766142991")).toBe(false);
  });
  it("sans configuration, personne n'est administrateur", () => {
    vi.stubEnv("ADMIN_PHONES", "");
    expect(estAdmin("+221778652991")).toBe(false);
  });
});
