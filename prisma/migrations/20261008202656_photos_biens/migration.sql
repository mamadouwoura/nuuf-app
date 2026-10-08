-- CreateTable
CREATE TABLE "PhotoBien" (
    "id" TEXT NOT NULL,
    "bienId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "fichier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoBien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoBien_fichier_key" ON "PhotoBien"("fichier");

-- CreateIndex
CREATE INDEX "PhotoBien_bienId_idx" ON "PhotoBien"("bienId");

-- AddForeignKey
ALTER TABLE "PhotoBien" ADD CONSTRAINT "PhotoBien_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

