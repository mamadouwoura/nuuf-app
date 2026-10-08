-- AlterTable
ALTER TABLE "FactureAbonnement" ADD COLUMN     "annuel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forfait" "Forfait" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FactureAbonnement_referenceOperateur_key" ON "FactureAbonnement"("referenceOperateur");

