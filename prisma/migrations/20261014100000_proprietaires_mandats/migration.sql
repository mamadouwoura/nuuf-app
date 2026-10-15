-- Propriétaires, mandats de gestion, retenues et reversements (compte rendu mensuel de gérance).
ALTER TABLE "Bien" ADD COLUMN "proprietaireId" TEXT;
CREATE INDEX "Bien_proprietaireId_idx" ON "Bien"("proprietaireId");

CREATE TABLE "Proprietaire" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "telephone" TEXT,
    "cni" TEXT,
    "adresse" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proprietaire_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Proprietaire_organisationId_idx" ON "Proprietaire"("organisationId");
ALTER TABLE "Proprietaire" ADD CONSTRAINT "Proprietaire_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bien" ADD CONSTRAINT "Bien_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Mandat" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "commissionPct" DOUBLE PRECISION NOT NULL,
    "debutLe" TIMESTAMP(3) NOT NULL,
    "dureeMois" INTEGER NOT NULL DEFAULT 12,
    "reconduction" BOOLEAN NOT NULL DEFAULT true,
    "jourReversement" INTEGER NOT NULL DEFAULT 10,
    "plafondTravaux" INTEGER,
    "preavisMois" INTEGER NOT NULL DEFAULT 1,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "signatureAgence" TEXT,
    "signatureProprietaire" TEXT,
    "signeLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mandat_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Mandat_organisationId_numero_key" ON "Mandat"("organisationId", "numero");
CREATE INDEX "Mandat_proprietaireId_idx" ON "Mandat"("proprietaireId");
ALTER TABLE "Mandat" ADD CONSTRAINT "Mandat_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "RetenueBilan" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetenueBilan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RetenueBilan_proprietaireId_mois_idx" ON "RetenueBilan"("proprietaireId", "mois");
ALTER TABLE "RetenueBilan" ADD CONSTRAINT "RetenueBilan_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Reversement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "montant" INTEGER NOT NULL,
    "reverseLe" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reversement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Reversement_proprietaireId_mois_key" ON "Reversement"("proprietaireId", "mois");
ALTER TABLE "Reversement" ADD CONSTRAINT "Reversement_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
