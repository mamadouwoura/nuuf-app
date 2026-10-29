import { describe, expect, it } from "vitest";
import { cleMois, depuisCle } from "@/lib/loyers";
import {
  MODELE_AVANT_DEFAUT,
  MODELE_RETARD_DEFAUT,
  REGLES_PAR_DEFAUT,
  decoupeJours,
  declencheurPour,
  modelePour,
  regleApplicable,
  remplirModele,
  reglesValides,
  validerModele,
  versJours,
} from "@/lib/relances-regles";

describe("règles de relance", () => {
  it("les trois règles d'origine donnent les mêmes rappels qu'avant (J-3, J+1, J+5)", () => {
    const r = REGLES_PAR_DEFAUT;
    expect(regleApplicable(-4, r)).toBeNull();
    expect(regleApplicable(-3, r)).toBe(-3);
    expect(regleApplicable(-1, r)).toBe(-3);
    expect(regleApplicable(0, r)).toBeNull();
    expect(regleApplicable(1, r)).toBe(1);
    expect(regleApplicable(4, r)).toBe(1);
    expect(regleApplicable(5, r)).toBe(5);
    expect(regleApplicable(40, r)).toBe(5);
  });
  it("une règle désactivée (absente de la liste) ne produit rien", () => {
    expect(regleApplicable(-2, [1, 5])).toBeNull();
    expect(regleApplicable(2, [-3, 5])).toBeNull(); // « avant » ne vaut jamais après l'échéance
    expect(regleApplicable(7, [-3, 1])).toBe(1); // dernière règle : couvre le retard restant
  });
  it("règles personnalisées : 7 jours avant, le jour même, 3 et 10 jours après", () => {
    const r = [-7, 0, 3, 10];
    expect(regleApplicable(-8, r)).toBeNull();
    expect(regleApplicable(-5, r)).toBe(-7);
    expect(regleApplicable(0, r)).toBe(0);
    expect(regleApplicable(2, r)).toBe(0);
    expect(regleApplicable(3, r)).toBe(3);
    expect(regleApplicable(9, r)).toBe(3);
    expect(regleApplicable(11, r)).toBe(10);
  });
  it("un loyer très en retard ne reçoit qu'une relance à la fois, la plus récente", () => {
    expect(regleApplicable(50, [1, 5, 10, 20])).toBe(20);
  });
  it("sans règle, aucune relance", () => {
    expect(regleApplicable(3, [])).toBeNull();
  });
  it("garde les décalages valides, sans doublon, triés et plafonnés à 8", () => {
    expect(reglesValides([5, 1, 1, -3, 99, -40, 2.5, Number.NaN])).toEqual([-3, 1, 5]);
    expect(reglesValides(Array.from({ length: 12 }, (_, i) => i))).toHaveLength(8);
  });
  it("noms de relance conservés dans l'historique", () => {
    expect([-3, 0, 1, 5, 12].map(declencheurPour)).toEqual(["J-3", "J+0", "J+1", "J+5", "J+12"]);
  });
  it("conversion entre le formulaire (avant / jour / après) et les jours", () => {
    expect(versJours("avant", 3)).toBe(-3);
    expect(versJours("jour", 0)).toBe(0);
    expect(versJours("apres", 5)).toBe(5);
    expect(decoupeJours(-3)).toEqual({ sens: "avant", nombre: 3 });
    expect(decoupeJours(0)).toEqual({ sens: "jour", nombre: 0 });
    expect(decoupeJours(5)).toEqual({ sens: "apres", nombre: 5 });
  });
});

describe("messages de relance personnalisés", () => {
  const valeurs = { prenom: "Awa", montant: "150 000 FCFA", bien: "F3 Ouakam", lien: "https://nuuf.sn/payer/X", jours: "3" };
  it("remplace les variables et laisse les inconnues telles quelles", () => {
    expect(remplirModele("Bonjour {prenom}, {montant} pour {bien} : {lien}", valeurs)).toBe("Bonjour Awa, 150 000 FCFA pour F3 Ouakam : https://nuuf.sn/payer/X");
    expect(remplirModele("Retard de {jours} jour(s) {inconnue}", valeurs)).toBe("Retard de 3 jour(s) {inconnue}");
  });
  it("un texte vide revient au texte par défaut", () => {
    expect(validerModele("   ")).toEqual({ ok: true, texte: null });
  });
  it("accepte un texte valide, nettoie les espaces", () => {
    const r = validerModele("  Bonjour   {prenom},\n\n votre loyer {montant} : {lien}  ");
    expect(r.ok).toBe(true);
    expect(r.ok && r.texte).toBe("Bonjour {prenom},\n\n votre loyer {montant} : {lien}");
  });
  it("refuse un texte trop court, trop long, avec variable inconnue ou accolade mal fermée", () => {
    expect(validerModele("Court {prenom}").ok).toBe(false);
    expect(validerModele("x".repeat(601)).ok).toBe(false);
    expect(validerModele("Bonjour {prenom}, votre loyer {secret} est dû ici").ok).toBe(false);
    expect(validerModele("Bonjour {prenom}, votre loyer {montant est dû ici").ok).toBe(false);
    expect(validerModele("Bonjour prenom}, votre loyer est dû ici maintenant").ok).toBe(false);
    expect(validerModele("Bonjour {prenom}, loyer dû\u0007 ici ok ok ok").ok).toBe(false);
  });
  it("choisit le texte avant ou après l'échéance, personnalisé ou par défaut", () => {
    expect(modelePour(-3, {})).toBe(MODELE_AVANT_DEFAUT);
    expect(modelePour(0, {})).toBe(MODELE_AVANT_DEFAUT);
    expect(modelePour(2, {})).toBe(MODELE_RETARD_DEFAUT);
    expect(modelePour(2, { modeleRetard: "Mon texte de retard {prenom}" })).toBe("Mon texte de retard {prenom}");
    expect(modelePour(-1, { modeleAvant: "Mon texte avant {prenom}" })).toBe("Mon texte avant {prenom}");
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
