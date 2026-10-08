-- CreateTable
CREATE TABLE "TentativeConnexion" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativeConnexion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TentativeConnexion_cle_creeLe_idx" ON "TentativeConnexion"("cle", "creeLe");

