-- Relances programmables : règles au choix, heure d'envoi, textes personnalisés, relances programmées.
-- Le tout dans une seule transaction : en cas d'erreur, rien n'est appliqué à moitié.
BEGIN;

-- Anciens réglages rattachés à une organisation qui n'existe plus (aucune clé étrangère ne les retenait) : on les retire.
DELETE FROM "ParametresRelance" WHERE "organisationId" NOT IN (SELECT "id" FROM "Organisation");

CREATE TABLE "RegleRelance" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "jours" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "RegleRelance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RegleRelance_organisationId_jours_key" ON "RegleRelance"("organisationId", "jours");
ALTER TABLE "RegleRelance" ADD CONSTRAINT "RegleRelance_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les trois anciens réglages (J-3, J+1, J+5) deviennent trois règles, avec leur état actuel.
INSERT INTO "RegleRelance" ("id", "organisationId", "jours", "actif")
SELECT 'r' || substr(md5(random()::text || clock_timestamp()::text || "organisationId" || '-3'), 1, 24), "organisationId", -3, "avantEcheance" FROM "ParametresRelance"
UNION ALL
SELECT 'r' || substr(md5(random()::text || clock_timestamp()::text || "organisationId" || '1'), 1, 24), "organisationId", 1, "apresJ1" FROM "ParametresRelance"
UNION ALL
SELECT 'r' || substr(md5(random()::text || clock_timestamp()::text || "organisationId" || '5'), 1, 24), "organisationId", 5, "apresJ5" FROM "ParametresRelance";

ALTER TABLE "ParametresRelance" ADD COLUMN "heureEnvoi" INTEGER NOT NULL DEFAULT 9;
ALTER TABLE "ParametresRelance" ADD COLUMN "modeleAvant" TEXT;
ALTER TABLE "ParametresRelance" ADD COLUMN "modeleRetard" TEXT;
ALTER TABLE "ParametresRelance" DROP COLUMN "avantEcheance";
ALTER TABLE "ParametresRelance" DROP COLUMN "apresJ1";
ALTER TABLE "ParametresRelance" DROP COLUMN "apresJ5";

CREATE TABLE "RelanceProgrammee" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "envoiLe" TIMESTAMP(3) NOT NULL,
    "envoyeeLe" TIMESTAMP(3),
    "annuleeLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RelanceProgrammee_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RelanceProgrammee_envoiLe_idx" ON "RelanceProgrammee"("envoiLe");
CREATE INDEX "RelanceProgrammee_echeanceId_idx" ON "RelanceProgrammee"("echeanceId");
ALTER TABLE "RelanceProgrammee" ADD CONSTRAINT "RelanceProgrammee_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RelanceProgrammee" ADD CONSTRAINT "RelanceProgrammee_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "Echeance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
