import { describe, expect, it } from "vitest";
import { celluleCsv, decoderFichier, lireCsv, norm } from "@/lib/csv";
import { analyserBiens, analyserProprietaires, lireDate, lireType } from "@/lib/import";

describe("lecture CSV", () => {
  it("détecte le point-virgule et les guillemets d'un export Excel", () => {
    const l = lireCsv('Nom;Téléphone;Adresse\r\n"Ndiaye; Ousmane";77 123 45 67;"Rue ""10"", Médina"\r\n');
    expect(l).toEqual([["Nom", "Téléphone", "Adresse"], ["Ndiaye; Ousmane", "77 123 45 67", 'Rue "10", Médina']]);
  });
  it("accepte la virgule, ignore les lignes vides et le BOM", () => {
    const l = lireCsv("﻿Nom,Ville\n\nAwa,Dakar\n,\nFatou,Thiès");
    expect(l).toEqual([["Nom", "Ville"], ["Awa", "Dakar"], ["Fatou", "Thiès"]]);
  });
  it("décode l'UTF-8, et le Windows-1252 quand le fichier n'est pas de l'UTF-8", () => {
    expect(decoderFichier(new TextEncoder().encode("Médina"))).toBe("Médina");
    expect(decoderFichier(Uint8Array.from([0x4d, 0xe9, 0x64, 0x69, 0x6e, 0x61]))).toBe("Médina");
  });
  it("neutralise les cellules qui seraient lues comme des formules", () => {
    expect(celluleCsv("=1+1")).toBe("\"'=1+1\"");
    expect(celluleCsv("Awa")).toBe('"Awa"');
  });
  it("normalise accents et casse", () => {
    expect(norm("  Téléphone du Locataire ")).toBe("telephone du locataire");
  });
});

describe("dates et types", () => {
  it("lit les formats de date courants et refuse les dates impossibles", () => {
    expect(lireDate("15/10/2026")?.toISOString().slice(0, 10)).toBe("2026-10-15");
    expect(lireDate("2026-10-15")?.toISOString().slice(0, 10)).toBe("2026-10-15");
    expect(lireDate("31/02/2026")).toBeNull();
    expect(lireDate("demain")).toBeNull();
  });
  it("reconnaît le type de bien d'après un libellé libre", () => {
    expect(lireType("")).toBe("APPARTEMENT");
    expect(lireType("Appartement F3")).toBe("APPARTEMENT");
    expect(lireType("Villa")).toBe("VILLA");
    expect(lireType("studio meublé")).toBe("STUDIO");
    expect(lireType("Boutique")).toBe("COMMERCIAL");
    expect(lireType("château")).toBeNull();
  });
});

const vide = () => ({ noms: new Set<string>(), telephones: new Set<string>() });

describe("import de propriétaires", () => {
  const entetes = ["Nom", "Téléphone", "E-mail", "Société (oui/non)"];
  it("valide les lignes correctes et signale les erreurs ligne par ligne", () => {
    const r = analyserProprietaires(
      [entetes, ["Ousmane Ndiaye", "77 123 45 67", "o@x.sn", "non"], ["Al", "77 000 00 00", "", ""], ["Awa Diop", "12", "", ""], ["SCI Teranga", "", "pas-un-mail", "oui"]],
      vide(),
    );
    expect(r.valides).toHaveLength(1);
    expect(r.valides[0]).toMatchObject({ nomComplet: "Ousmane Ndiaye", telephone: "+221771234567", personneMorale: false });
    expect(r.lignes.map((l) => l.statut)).toEqual(["ok", "erreur", "erreur", "erreur"]);
    expect(r.lignes[0].numero).toBe(2);
  });
  it("ignore ceux qui existent déjà (même nom ou même téléphone) et les doublons du fichier", () => {
    const existants = { noms: new Set([norm("Ousmane Ndiaye")]), telephones: new Set(["+221779998877"]) };
    const r = analyserProprietaires([entetes, ["ousmane  NDIAYE", "", "", ""], ["Autre Nom", "77 999 88 77", "", ""], ["Nouveau Un", "", "", ""], ["Nouveau un", "", "", ""]], existants);
    expect(r.lignes.map((l) => l.statut)).toEqual(["existe", "existe", "ok", "existe"]);
    expect(r.valides.map((v) => v.nomComplet)).toEqual(["Nouveau Un"]);
  });
  it("refuse un fichier sans colonne de nom", () => {
    const r = analyserProprietaires([["Téléphone"], ["77 123 45 67"]], vide());
    expect(r.manquantes.length).toBe(1);
    expect(r.valides).toHaveLength(0);
  });
});

describe("import de biens", () => {
  const entetes = ["Propriétaire", "Désignation", "Type", "Quartier", "Loyer", "Locataire", "Téléphone du locataire", "Début du bail"];
  const ctx = (extra = {}) => ({ proprietaires: new Set([norm("Ousmane Ndiaye")]), existants: new Set<string>(), capacite: 10, ...extra });

  it("crée un bien avec locataire, bail et valeurs par défaut", () => {
    const r = analyserBiens([entetes, ["Ousmane Ndiaye", "F3 Ouakam", "Appartement", "Ouakam", "150 000", "Awa Diallo", "77 765 43 21", "01/10/2026"]], ctx());
    expect(r.valides).toHaveLength(1);
    expect(r.valides[0]).toMatchObject({ designation: "F3 Ouakam", type: "APPARTEMENT", loyer: 150000, cautionMois: 2, jour: 5, ville: "Dakar" });
    expect(r.valides[0].locataire).toMatchObject({ nom: "Awa Diallo", telephone: "+221777654321" });
    expect(r.valides[0].debut?.toISOString().slice(0, 10)).toBe("2026-10-01");
  });
  it("accepte un bien vacant (sans locataire) et sans propriétaire", () => {
    const r = analyserBiens([entetes, ["", "Studio Plateau", "Studio", "Plateau", "90000", "", "", ""]], ctx());
    expect(r.valides[0].locataire).toBeNull();
    expect(r.valides[0].debut).toBeNull();
    expect(r.valides[0].proprietaireNom).toBeNull();
  });
  it("signale propriétaire inconnu, type inconnu, loyer ou téléphone manquants, date invalide", () => {
    const r = analyserBiens(
      [entetes, ["Inconnu Total", "Bien A", "Appartement", "Q", "100000", "", "", ""], ["", "Bien B", "Château", "Q", "100000", "", "", ""], ["", "Bien C", "Villa", "Q", "", "Awa Diallo", "77 765 43 21", ""], ["", "Bien D", "Villa", "Q", "100000", "Awa Diallo", "", ""], ["", "Bien E", "Villa", "Q", "100000", "Awa Diallo", "77 765 43 21", "32/13/2026"]],
      ctx(),
    );
    expect(r.valides).toHaveLength(0);
    expect(r.lignes.every((l) => l.statut === "erreur")).toBe(true);
    expect(r.lignes[0].erreurs[0].cle).toContain("Propriétaire inconnu");
  });
  it("saute les biens déjà présents et respecte la limite du forfait", () => {
    const existants = new Set([`${norm("F3 Ouakam")}|${norm("Ouakam")}`]);
    const r = analyserBiens(
      [entetes, ["", "F3 Ouakam", "", "Ouakam", "100000", "", "", ""], ["", "Bien 1", "", "Q1", "100000", "", "", ""], ["", "Bien 2", "", "Q2", "100000", "", "", ""], ["", "Bien 3", "", "Q3", "100000", "", "", ""]],
      ctx({ existants, capacite: 2 }),
    );
    expect(r.lignes.map((l) => l.statut)).toEqual(["existe", "ok", "ok", "erreur"]);
    expect(r.lignes[3].erreurs[0].cle).toContain("Limite de logements");
    expect(r.valides).toHaveLength(2);
  });
  it("refuse un fichier sans désignation ni loyer", () => {
    expect(analyserBiens([["Quartier"], ["Ouakam"]], ctx()).manquantes.length).toBe(1);
  });
});
