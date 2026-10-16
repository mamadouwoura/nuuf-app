import { randomBytes } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { solderEtQuittancer } from "@/lib/encaissement";
import { notifier } from "@/lib/notifications";
import { statistiques } from "@/lib/stats";
import { soldeAvant, tresorerieDuMois } from "@/lib/tresorerie";
import { baseDeTest, creerOrganisation, supprimerOrganisation } from "./aide";

const orgs: string[] = [];
const utilisateurs: string[] = [];
afterAll(async () => {
  for (const id of orgs) await supprimerOrganisation(id).catch(() => {});
  await db.utilisateur.deleteMany({ where: { id: { in: utilisateurs } } }).catch(() => {});
  await db.$disconnect();
});

const debutDuMois = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
};
const moisPlus = (m: Date, k: number) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + k, 1));

async function equipe(orgId: string, n: number) {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const u = await db.utilisateur.create({ data: { telephone: `+22177${randomBytes(4).readUInt32BE().toString().slice(0, 7).padStart(7, "0")}`, nomComplet: `Membre ${i}`, motDePasse: "x" } });
    utilisateurs.push(u.id);
    await db.membre.create({ data: { organisationId: orgId, utilisateurId: u.id, role: i === 0 ? "PROPRIETAIRE" : "GESTIONNAIRE" } });
    ids.push(u.id);
  }
  return ids;
}

describe.skipIf(!baseDeTest)("notifications", () => {
  it("préviennent tous les membres sauf l'auteur de l'action", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const [u1, u2, u3] = await equipe(a.org.id, 3);
    const n = await notifier(db, { organisationId: a.org.id, categorie: "BIENS", titre: "Nouveau bien", sauf: u1 });
    expect(n).toBe(2);
    expect(await db.notification.count({ where: { utilisateurId: u1 } })).toBe(0);
    expect(await db.notification.count({ where: { utilisateurId: u2 } })).toBe(1);
    expect(await db.notification.count({ where: { utilisateurId: u3 } })).toBe(1);
  });

  it("respectent les catégories désactivées, sauf l'abonnement", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    const [u1, u2] = await equipe(a.org.id, 2);
    await db.preferenceNotification.create({ data: { utilisateurId: u2, categorie: "PAIEMENTS", actif: false } });
    expect(await notifier(db, { organisationId: a.org.id, categorie: "PAIEMENTS", titre: "Paiement reçu" })).toBe(1);
    expect(await db.notification.count({ where: { utilisateurId: u1, categorie: "PAIEMENTS" } })).toBe(1);
    expect(await db.notification.count({ where: { utilisateurId: u2, categorie: "PAIEMENTS" } })).toBe(0);
    // l'abonnement ne se coupe pas
    await db.preferenceNotification.create({ data: { utilisateurId: u2, categorie: "ABONNEMENT", actif: false } });
    expect(await notifier(db, { organisationId: a.org.id, categorie: "ABONNEMENT", titre: "Essai prolongé" })).toBe(2);
  });

  it("n'atteignent que l'organisation concernée", async () => {
    const a = await creerOrganisation();
    const b = await creerOrganisation();
    orgs.push(a.org.id, b.org.id);
    const [ua] = await equipe(a.org.id, 1);
    const [ub] = await equipe(b.org.id, 1);
    await notifier(db, { organisationId: a.org.id, categorie: "BAUX", titre: "Nouvelle location" });
    expect(await db.notification.count({ where: { utilisateurId: ua } })).toBe(1);
    expect(await db.notification.count({ where: { utilisateurId: ub } })).toBe(0);
  });

  it("un paiement confirmé prévient l'équipe (sauf celui qui encaisse) avec les variables du message", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const [auteur, collegue] = await equipe(a.org.id, 2);
    await db.$transaction(async (tx) => {
      const p = await tx.paiement.create({ data: { echeanceId: a.echeance.id, montant: 60_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
      await solderEtQuittancer(tx, { organisationId: a.org.id, echeanceId: a.echeance.id, paiementId: p.id, acteurId: auteur });
    });
    expect(await db.notification.count({ where: { utilisateurId: auteur } })).toBe(0);
    const n = await db.notification.findFirstOrThrow({ where: { utilisateurId: collegue } });
    expect(n.categorie).toBe("PAIEMENTS");
    expect(n.titre).toBe("Paiement reçu");
    expect(n.donnees).toMatchObject({ locataire: a.locataire.nomComplet, bien: a.bien.designation });
    expect(String((n.donnees as { montant: string }).montant).replace(/\D/g, "")).toBe("60000");
  });
});

describe.skipIf(!baseDeTest)("solde précédent de la trésorerie", () => {
  it("reporte ce qui précède le mois, jamais le mois lui-même ni les autres organisations", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    const autre = await creerOrganisation({ loyer: 50_000 });
    orgs.push(a.org.id, autre.org.id);
    const mois = debutDuMois();
    const passe = moisPlus(mois, -1);
    const proprio = await db.proprietaire.create({ data: { organisationId: a.org.id, nomComplet: "Propriétaire" } });
    // le mois précédent : 100 000 reçus, 30 000 de dépenses, 10 000 d'entrée, 40 000 reversés, 5 000 avancés
    const echeancePasse = await db.echeance.create({ data: { bailId: a.bail.id, mois: passe, montantDu: 100_000, dateLimite: passe } });
    await db.paiement.create({ data: { echeanceId: echeancePasse.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date(passe.getTime() + 5 * 86_400_000) } });
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "SORTIE", categorie: "Autre", libelle: "Travaux", montant: 30_000, date: new Date(passe.getTime() + 86_400_000) } });
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "ENTREE", categorie: "Autre", libelle: "Dossier", montant: 10_000, date: new Date(passe.getTime() + 86_400_000) } });
    await db.reversement.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, mois: passe, montant: 40_000, reverseLe: new Date(passe.getTime() + 10 * 86_400_000) } });
    await db.avanceProprietaire.create({ data: { organisationId: a.org.id, proprietaireId: proprio.id, montant: 5_000, accordeLe: new Date(passe.getTime() + 2 * 86_400_000) } });
    // ce mois-ci : une dépense qui ne doit pas entrer dans le solde précédent
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "SORTIE", categorie: "Autre", libelle: "Courant", montant: 7_000, date: new Date() } });

    expect(await soldeAvant(a.org.id, mois)).toBe(100_000 + 10_000 - 30_000 - 40_000 - 5_000);
    expect(await soldeAvant(autre.org.id, mois)).toBe(0);
    const r = await tresorerieDuMois(a.org.id, mois);
    expect(r.soldePrecedent).toBe(35_000);
    expect(r.solde).toBe(r.entrees - r.sorties);
    expect(r.soldeFinal).toBe(35_000 + r.solde);
  });

  it("conserve la référence et le mode de paiement d'une dépense", async () => {
    const a = await creerOrganisation();
    orgs.push(a.org.id);
    await db.transaction.create({ data: { organisationId: a.org.id, sens: "SORTIE", categorie: "Autre", libelle: "Peinture", montant: 12_000, date: new Date(), reference: "FAC-2026-14", modePaiement: "WAVE" } });
    const r = await tresorerieDuMois(a.org.id, debutDuMois());
    expect(r.transactions[0]).toMatchObject({ reference: "FAC-2026-14", modePaiement: "WAVE" });
  });
});

describe.skipIf(!baseDeTest)("loyers payés d'avance", () => {
  it("sont comptés à part dans les statistiques sans fausser le mois courant", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const futur = moisPlus(debutDuMois(), 1);
    const e = await db.echeance.create({ data: { bailId: a.bail.id, mois: futur, montantDu: 100_000, dateLimite: new Date(futur.getTime() + 4 * 86_400_000) } });
    await db.paiement.create({ data: { echeanceId: e.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    const s = await statistiques(a.org.id, debutDuMois());
    expect(s.payeDAvance).toEqual({ montant: 100_000, nb: 1 });
    expect(s.encaisse).toBe(0);
    expect(s.attendu).toBe(100_000);
    expect(s.arrieres.total).toBeLessThanOrEqual(100_000);
  });

  it("restent invisibles pour une autre organisation", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    const b = await creerOrganisation({ loyer: 80_000 });
    orgs.push(a.org.id, b.org.id);
    const futur = moisPlus(debutDuMois(), 2);
    const e = await db.echeance.create({ data: { bailId: a.bail.id, mois: futur, montantDu: 100_000, dateLimite: futur } });
    await db.paiement.create({ data: { echeanceId: e.id, montant: 100_000, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
    expect((await statistiques(b.org.id, debutDuMois())).payeDAvance.montant).toBe(0);
  });
});

describe.skipIf(!baseDeTest)("numérotation des quittances", () => {
  it("ne réutilise jamais un numéro, même si une quittance du mois a été supprimée", async () => {
    const a = await creerOrganisation({ loyer: 100_000 });
    orgs.push(a.org.id);
    const emettre = (montant: number) =>
      db.$transaction(async (tx) => {
        const p = await tx.paiement.create({ data: { echeanceId: a.echeance.id, montant, canal: "ESPECES", statut: "CONFIRME", recuLe: new Date() } });
        return solderEtQuittancer(tx, { organisationId: a.org.id, echeanceId: a.echeance.id, paiementId: p.id });
      });
    const q1 = await emettre(10_000);
    const q2 = await emettre(10_000);
    expect(q2.numero).not.toBe(q1.numero);
    await db.quittance.delete({ where: { id: q1.id } }); // le comptage tomberait à 1 : l'ancien calcul redonnait le numéro du deuxième
    const q3 = await emettre(10_000);
    expect([q2.numero, q3.numero]).toHaveLength(2);
    expect(q3.numero).not.toBe(q2.numero);
    expect(Number(q3.numero.slice(-3))).toBeGreaterThan(Number(q2.numero.slice(-3)));
  });
});
