import { describe, expect, it } from "vitest";
import { MODULES, modulesValides, moduleDeChemin, peutAcceder } from "@/lib/modules";
import { expirationInvitation, hashJeton, invitationValide, nouveauJeton } from "@/lib/invitations";
import { remplir } from "@/lib/email";

describe("permissions par module", () => {
  const gestionnaire = { role: "GESTIONNAIRE" as const, modulesRefuses: ["TRESORERIE", "GERANCE"] };
  it("le propriétaire du compte garde tout, même si une liste de refus est présente", () => {
    expect(MODULES.every((m) => peutAcceder({ role: "PROPRIETAIRE", modulesRefuses: ["TRESORERIE"] }, m.code))).toBe(true);
  });
  it("retire seulement les modules refusés au collaborateur", () => {
    expect(peutAcceder(gestionnaire, "TRESORERIE")).toBe(false);
    expect(peutAcceder(gestionnaire, "GERANCE")).toBe(false);
    expect(peutAcceder(gestionnaire, "LOYERS")).toBe(true);
    expect(peutAcceder({ role: "LECTURE_SEULE", modulesRefuses: [] }, "PATRIMOINE")).toBe(true);
  });
  it("associe chaque écran à son module", () => {
    expect(moduleDeChemin("/biens")).toBe("PATRIMOINE");
    expect(moduleDeChemin("/biens/abc/modifier")).toBe("PATRIMOINE");
    expect(moduleDeChemin("/locataires/x/fiche")).toBe("PATRIMOINE");
    expect(moduleDeChemin("/paiements")).toBe("LOYERS");
    expect(moduleDeChemin("/quittances")).toBe("LOYERS");
    expect(moduleDeChemin("/proprietaires/1/bilan")).toBe("GERANCE");
    expect(moduleDeChemin("/bilans")).toBe("GERANCE");
    expect(moduleDeChemin("/tresorerie")).toBe("TRESORERIE");
    expect(moduleDeChemin("/statistiques")).toBe("STATISTIQUES");
  });
  it("laisse accessibles les écrans communs et ne confond pas deux préfixes proches", () => {
    expect(moduleDeChemin("/tableau-de-bord")).toBeUndefined();
    expect(moduleDeChemin("/notifications")).toBeUndefined();
    expect(moduleDeChemin("/parametres")).toBeUndefined();
    expect(moduleDeChemin("/biensxyz")).toBeUndefined();
  });
  it("ignore toute valeur de formulaire qui n'est pas un module connu", () => {
    expect(modulesValides(["LOYERS", "ADMIN", "LOYERS", "<script>"])).toEqual(["LOYERS"]);
  });
});

describe("invitations", () => {
  it("génère un jeton long et n'enregistre que son empreinte", () => {
    const a = nouveauJeton();
    const b = nouveauJeton();
    expect(a.jeton).toMatch(/^[0-9a-f]{64}$/);
    expect(a.jeton).not.toBe(b.jeton);
    expect(a.hash).toBe(hashJeton(a.jeton));
    expect(a.hash).not.toContain(a.jeton);
    expect(hashJeton("autre")).not.toBe(a.hash);
  });
  it("n'est valable que si elle n'est ni acceptée ni expirée", () => {
    const now = new Date("2026-10-17T10:00:00Z");
    const fin = expirationInvitation(now);
    expect(fin.getTime() - now.getTime()).toBe(7 * 86_400_000);
    expect(invitationValide({ accepteeLe: null, expireLe: fin }, now)).toBe(true);
    expect(invitationValide({ accepteeLe: null, expireLe: fin }, new Date(fin.getTime() + 1))).toBe(false);
    expect(invitationValide({ accepteeLe: now, expireLe: fin }, now)).toBe(false);
  });
});

describe("modèles de messages", () => {
  it("remplace les variables et laisse intacte celle qui manque", () => {
    expect(remplir("{locataire} a payé {montant} FCFA ({bien}).", { locataire: "Awa", montant: "60 000", bien: "F3" })).toBe("Awa a payé 60 000 FCFA (F3).");
    expect(remplir("Bonjour {nom}", {})).toBe("Bonjour {nom}");
    expect(remplir("Sans variable", null)).toBe("Sans variable");
  });
});
