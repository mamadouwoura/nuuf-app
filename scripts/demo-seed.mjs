// Crée (ou recrée) un compte de démonstration avec quelques biens, loyers et quittances.
// Usage : DATABASE_URL=… node scripts/demo-seed.mjs "+221771234567" "MotDePasseDemo-2026"
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const [, , telBrut, motDePasse] = process.argv;
if (!process.env.DATABASE_URL || !telBrut || !motDePasse) {
  console.error('Usage : DATABASE_URL=… node scripts/demo-seed.mjs "+221771234567" "mot-de-passe"');
  process.exit(1);
}
const chiffres = telBrut.replace(/\D/g, "").replace(/^(00)?221/, "");
if (!/^7[0-9]{8}$/.test(chiffres)) { console.error("Numéro invalide (ex. +221771234567)."); process.exit(1); }
const telephone = `+221${chiffres}`;
const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(motDePasse, salt, 64).toString("hex")}`;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 }) });
const JOUR = 86_400_000;
const maintenant = new Date();
const moisCourant = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1));
const moisPrec = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - 1, 1));

const existant = await db.utilisateur.findUnique({ where: { telephone }, include: { membres: true } });
if (existant) {
  for (const m of existant.membres) await db.organisation.delete({ where: { id: m.organisationId } });
  await db.utilisateur.delete({ where: { id: existant.id } });
}

const user = await db.utilisateur.create({
  data: {
    telephone,
    nomComplet: "Moussa Diop",
    motDePasse: hash,
    telVerifieLe: maintenant,
    membres: {
      create: {
        role: "PROPRIETAIRE",
        organisation: {
          create: {
            nom: "Moussa Diop",
            ville: "Dakar",
            tailleParc: "1-5",
            abonnement: { create: { forfait: "PRO", statut: "ACTIF", periodeFinLe: new Date(maintenant.getTime() + 25 * JOUR) } },
          },
        },
      },
    },
  },
  include: { membres: true },
});
const orgId = user.membres[0].organisationId;

const BIENS = [
  ["Appartement F3 - Ouakam", "APPARTEMENT", "Ouakam", "Awa Diallo", "+221774528912", 150_000, "ESPECES", "PAYE"],
  ["Studio C1 - Ngor", "STUDIO", "Ngor", "Ibrahima Fall", "+221773001122", 200_000, "ORANGE_MONEY", "PAYE"],
  ["Villa Almadies", "VILLA", "Almadies", "Cheikh Ba", "+221762345678", 300_000, "WAVE", "PAYE"],
  ["Appartement F4 - Mermoz", "APPARTEMENT", "Mermoz / Sacré-Cœur", "Saliou Ndiaye", "+221778889999", 250_000, null, "RETARD"],
];
let numero = 0;
for (const [designation, type, quartier, nom, tel, loyer, canal, etat] of BIENS) {
  const bien = await db.bien.create({ data: { organisationId: orgId, designation, type, quartier, ville: "Dakar", surfaceM2: type === "STUDIO" ? 32 : 90 } });
  const loc = await db.locataire.create({ data: { organisationId: orgId, nomComplet: nom, telephone: tel } });
  const bail = await db.bail.create({ data: { bienId: bien.id, locataireId: loc.id, loyerMensuel: loyer, jourEcheance: 5, debutLe: new Date(maintenant.getTime() - 120 * JOUR) } });
  for (const mois of [moisPrec, moisCourant]) {
    const limite = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth(), 5));
    const paye = etat === "PAYE" || mois === moisPrec;
    const echeance = await db.echeance.create({
      data: {
        bailId: bail.id, mois, montantDu: loyer, dateLimite: limite, statut: paye ? "PAYEE" : "EN_ATTENTE",
        jetonPaiement: randomBytes(16).toString("hex"), jetonExpireLe: new Date(maintenant.getTime() + 72 * 3_600_000),
      },
    });
    if (paye) {
      const p = await db.paiement.create({ data: { echeanceId: echeance.id, montant: loyer, canal: canal ?? "WAVE", statut: "CONFIRME", recuLe: limite } });
      numero++;
      await db.quittance.create({
        data: {
          organisationId: orgId, paiementId: p.id, jetonQr: randomBytes(16).toString("hex"), emiseLe: limite,
          numero: `Q-${mois.getUTCFullYear()}-${String(mois.getUTCMonth() + 1).padStart(2, "0")}-${String(numero).padStart(3, "0")}`,
        },
      });
    }
  }
}
console.log(`Compte de démonstration prêt : ${telephone} (4 biens, loyers, quittances).`);
await db.$disconnect();
