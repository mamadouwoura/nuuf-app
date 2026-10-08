-- DropIndex
DROP INDEX "Quittance_numero_key";

-- AlterTable
ALTER TABLE "Quittance" ADD COLUMN     "organisationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quittance_organisationId_numero_key" ON "Quittance"("organisationId", "numero");

