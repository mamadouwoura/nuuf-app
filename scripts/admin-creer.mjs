// Crée (ou réinitialise le mot de passe de) un compte administrateur Nuuf, sans espace bailleur.
// Usage : DATABASE_URL=… node scripts/admin-creer.mjs "+221778652991" "mot-de-passe"
// Le numéro doit aussi figurer dans la variable ADMIN_PHONES de l'environnement qui sert l'application.
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const [, , telBrut, motDePasse] = process.argv;
if (!process.env.DATABASE_URL || !telBrut || !motDePasse) {
  console.error('Usage : DATABASE_URL=… node scripts/admin-creer.mjs "+221778652991" "mot-de-passe"');
  process.exit(1);
}
if (motDePasse.length < 12) { console.error("Mot de passe trop court (12 caractères minimum)."); process.exit(1); }
const chiffres = telBrut.replace(/\D/g, "").replace(/^(00)?221/, "");
if (!/^7[0-9]{8}$/.test(chiffres)) { console.error("Numéro invalide (ex. +221778652991)."); process.exit(1); }
const telephone = `+221${chiffres}`;
const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(motDePasse, salt, 64).toString("hex")}`;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }) });
const existant = await db.utilisateur.findUnique({ where: { telephone } });
if (existant) {
  await db.utilisateur.update({ where: { id: existant.id }, data: { motDePasse: hash, telVerifieLe: new Date(), sessionVersion: { increment: 1 } } });
  console.log(`Compte administrateur ${telephone} : mot de passe réinitialisé.`);
} else {
  await db.utilisateur.create({ data: { telephone, nomComplet: "Administrateur Nuuf", motDePasse: hash, telVerifieLe: new Date() } });
  console.log(`Compte administrateur ${telephone} créé.`);
}
await db.$disconnect();
