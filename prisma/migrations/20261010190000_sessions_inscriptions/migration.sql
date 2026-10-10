-- Sessions enregistrées côté serveur et inscriptions en attente de confirmation du code.
CREATE TABLE "SessionUtilisateur" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireLe" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SessionUtilisateur_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SessionUtilisateur_utilisateurId_idx" ON "SessionUtilisateur"("utilisateurId");
CREATE INDEX "SessionUtilisateur_expireLe_idx" ON "SessionUtilisateur"("expireLe");
ALTER TABLE "SessionUtilisateur" ADD CONSTRAINT "SessionUtilisateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "InscriptionEnAttente" (
    "id" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "ville" TEXT,
    "tailleParc" TEXT,
    "codeHash" TEXT NOT NULL,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "envois" INTEGER NOT NULL DEFAULT 1,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireLe" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InscriptionEnAttente_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InscriptionEnAttente_telephone_key" ON "InscriptionEnAttente"("telephone");
CREATE INDEX "InscriptionEnAttente_expireLe_idx" ON "InscriptionEnAttente"("expireLe");
