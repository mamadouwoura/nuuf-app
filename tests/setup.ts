import "dotenv/config";

process.env.SESSION_SECRET ??= "secret-de-test-0123456789abcdef0123456789";
process.env.MESSAGERIE_MODE = "simulation";
process.env.APP_URL = "http://localhost:3000";
// Les tests d'intégration n'utilisent JAMAIS la base de développement.
if (process.env.DATABASE_URL_TEST) process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
