-- Lot 1 : commission agent, avances aux propriétaires, transactions hors loyers.
CREATE TYPE "SensTransaction" AS ENUM ('ENTREE', 'SORTIE');

ALTER TABLE "Mandat" ADD COLUMN "agentNom" TEXT;
ALTER TABLE "Mandat" ADD COLUMN "commissionAgentPct" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE TABLE "AvanceProprietaire" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "accordeLe" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "mensualite" INTEGER,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvanceProprietaire_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AvanceProprietaire_proprietaireId_idx" ON "AvanceProprietaire"("proprietaireId");
ALTER TABLE "AvanceProprietaire" ADD CONSTRAINT "AvanceProprietaire_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "RemboursementAvance" (
    "id" TEXT NOT NULL,
    "avanceId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "mois" TIMESTAMP(3),
    "recuLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "RemboursementAvance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RemboursementAvance_avanceId_mois_key" ON "RemboursementAvance"("avanceId", "mois");
ALTER TABLE "RemboursementAvance" ADD CONSTRAINT "RemboursementAvance_avanceId_fkey" FOREIGN KEY ("avanceId") REFERENCES "AvanceProprietaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "sens" "SensTransaction" NOT NULL,
    "categorie" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "proprietaireId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Transaction_organisationId_date_idx" ON "Transaction"("organisationId", "date");
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
