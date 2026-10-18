-- Avenants à un bail : modifications écrites du contrat, numérotées par bail.
CREATE TABLE "Avenant" (
    "id" TEXT NOT NULL,
    "bailId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "effetLe" TIMESTAMP(3) NOT NULL,
    "ancienLoyer" INTEGER,
    "nouveauLoyer" INTEGER,
    "ancienneFinLe" TIMESTAMP(3),
    "nouvelleFinLe" TIMESTAMP(3),
    "clause" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Avenant_bailId_numero_key" ON "Avenant"("bailId", "numero");
ALTER TABLE "Avenant" ADD CONSTRAINT "Avenant_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "Bail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
