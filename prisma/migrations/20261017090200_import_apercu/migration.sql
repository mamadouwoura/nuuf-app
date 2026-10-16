-- Fichier d'import en attente de confirmation (aperçu) : conservé une heure au plus.
CREATE TABLE "ImportApercu" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "csv" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportApercu_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ImportApercu_utilisateurId_creeLe_idx" ON "ImportApercu"("utilisateurId", "creeLe");
ALTER TABLE "ImportApercu" ADD CONSTRAINT "ImportApercu_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
