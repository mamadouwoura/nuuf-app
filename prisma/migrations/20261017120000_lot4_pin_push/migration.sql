-- Lot 4 : code PIN avec verrouillage, abonnements aux notifications push.
ALTER TABLE "Utilisateur" ADD COLUMN "pinHash" TEXT;
ALTER TABLE "Utilisateur" ADD COLUMN "pinDefiniLe" TIMESTAMP(3);
ALTER TABLE "Utilisateur" ADD COLUMN "verrouillageMin" INTEGER NOT NULL DEFAULT 10;

ALTER TABLE "SessionUtilisateur" ADD COLUMN "activiteLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "AbonnementPush" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "appareil" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AbonnementPush_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AbonnementPush_endpoint_key" ON "AbonnementPush"("endpoint");
CREATE INDEX "AbonnementPush_utilisateurId_idx" ON "AbonnementPush"("utilisateurId");
ALTER TABLE "AbonnementPush" ADD CONSTRAINT "AbonnementPush_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
