-- Documents du locataire, motif de fin de bail, trace des consultations d'historique.
ALTER TABLE "Bail" ADD COLUMN "motifFin" TEXT;

CREATE TABLE "DocumentLocataire" (
    "id" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "fichier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentLocataire_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DocumentLocataire_fichier_key" ON "DocumentLocataire"("fichier");
CREATE INDEX "DocumentLocataire_locataireId_idx" ON "DocumentLocataire"("locataireId");
ALTER TABLE "DocumentLocataire" ADD CONSTRAINT "DocumentLocataire_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "Locataire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ConsultationHistorique" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "telephone" TEXT NOT NULL,
    "dossiers" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationHistorique_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ConsultationHistorique_organisationId_creeLe_idx" ON "ConsultationHistorique"("organisationId", "creeLe");
ALTER TABLE "ConsultationHistorique" ADD CONSTRAINT "ConsultationHistorique_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
