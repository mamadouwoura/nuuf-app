-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROPRIETAIRE', 'GESTIONNAIRE', 'LECTURE_SEULE');

-- CreateEnum
CREATE TYPE "Forfait" AS ENUM ('DECOUVERTE', 'BAILLEUR', 'PRO', 'AGENCE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ESSAI', 'ACTIF', 'GRACE', 'LECTURE_SEULE', 'RESILIE');

-- CreateEnum
CREATE TYPE "TypeBien" AS ENUM ('APPARTEMENT', 'VILLA', 'STUDIO', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "StatutEcheance" AS ENUM ('EN_ATTENTE', 'PAYEE', 'PARTIELLE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "CanalPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'ESPECES', 'VIREMENT');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('INITIE', 'CONFIRME', 'ECHEC', 'EXPIRE');

-- CreateEnum
CREATE TYPE "CanalMessage" AS ENUM ('WHATSAPP', 'SMS');

-- CreateEnum
CREATE TYPE "TypeMessage" AS ENUM ('OTP', 'LIEN_PAIEMENT', 'QUITTANCE', 'RELANCE', 'RENOUVELLEMENT');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ninea" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "telVerifieLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membre" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeOtp" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "utiliseLe" TIMESTAMP(3),
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abonnement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "forfait" "Forfait" NOT NULL,
    "statut" "StatutAbonnement" NOT NULL,
    "annuel" BOOLEAN NOT NULL DEFAULT false,
    "essaiFinLe" TIMESTAMP(3),
    "periodeFinLe" TIMESTAMP(3),
    "graceFinLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactureAbonnement" (
    "id" TEXT NOT NULL,
    "abonnementId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "nbLogements" INTEGER NOT NULL,
    "periodeDebut" TIMESTAMP(3) NOT NULL,
    "periodeFin" TIMESTAMP(3) NOT NULL,
    "payeeLe" TIMESTAMP(3),
    "referenceOperateur" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactureAbonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteEncaissement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "canal" "CanalPaiement" NOT NULL,
    "telephone" TEXT NOT NULL,
    "libelle" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompteEncaissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bien" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "type" "TypeBien" NOT NULL,
    "quartier" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT,
    "surfaceM2" INTEGER,
    "description" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archiveLe" TIMESTAMP(3),

    CONSTRAINT "Bien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locataire" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "cni" TEXT,
    "profession" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Locataire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bail" (
    "id" TEXT NOT NULL,
    "bienId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "loyerMensuel" INTEGER NOT NULL,
    "chargesIncluses" BOOLEAN NOT NULL DEFAULT true,
    "cautionMois" INTEGER NOT NULL DEFAULT 2,
    "jourEcheance" INTEGER NOT NULL DEFAULT 5,
    "debutLe" TIMESTAMP(3) NOT NULL,
    "finLe" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Echeance" (
    "id" TEXT NOT NULL,
    "bailId" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "montantDu" INTEGER NOT NULL,
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "statut" "StatutEcheance" NOT NULL DEFAULT 'EN_ATTENTE',
    "jetonPaiement" TEXT,
    "jetonExpireLe" TIMESTAMP(3),

    CONSTRAINT "Echeance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "canal" "CanalPaiement" NOT NULL,
    "statut" "StatutPaiement" NOT NULL,
    "referenceOperateur" TEXT,
    "recuLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quittance" (
    "id" TEXT NOT NULL,
    "paiementId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "jetonQr" TEXT NOT NULL,
    "emiseLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quittance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relance" (
    "id" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "declencheur" TEXT NOT NULL,
    "envoyeeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "canal" "CanalMessage" NOT NULL,
    "type" "TypeMessage" NOT NULL,
    "destinataire" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAction" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "action" TEXT NOT NULL,
    "cible" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Membre_organisationId_utilisateurId_key" ON "Membre"("organisationId", "utilisateurId");

-- CreateIndex
CREATE INDEX "CodeOtp_utilisateurId_expireLe_idx" ON "CodeOtp"("utilisateurId", "expireLe");

-- CreateIndex
CREATE UNIQUE INDEX "Abonnement_organisationId_key" ON "Abonnement"("organisationId");

-- CreateIndex
CREATE INDEX "Bien_organisationId_idx" ON "Bien"("organisationId");

-- CreateIndex
CREATE INDEX "Locataire_organisationId_idx" ON "Locataire"("organisationId");

-- CreateIndex
CREATE INDEX "Bail_bienId_idx" ON "Bail"("bienId");

-- CreateIndex
CREATE INDEX "Bail_locataireId_idx" ON "Bail"("locataireId");

-- CreateIndex
CREATE UNIQUE INDEX "Echeance_jetonPaiement_key" ON "Echeance"("jetonPaiement");

-- CreateIndex
CREATE UNIQUE INDEX "Echeance_bailId_mois_key" ON "Echeance"("bailId", "mois");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_referenceOperateur_key" ON "Paiement"("referenceOperateur");

-- CreateIndex
CREATE UNIQUE INDEX "Quittance_paiementId_key" ON "Quittance"("paiementId");

-- CreateIndex
CREATE UNIQUE INDEX "Quittance_numero_key" ON "Quittance"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Quittance_jetonQr_key" ON "Quittance"("jetonQr");

-- CreateIndex
CREATE INDEX "JournalAction_organisationId_creeLe_idx" ON "JournalAction"("organisationId", "creeLe");

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membre" ADD CONSTRAINT "Membre_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeOtp" ADD CONSTRAINT "CodeOtp_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactureAbonnement" ADD CONSTRAINT "FactureAbonnement_abonnementId_fkey" FOREIGN KEY ("abonnementId") REFERENCES "Abonnement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteEncaissement" ADD CONSTRAINT "CompteEncaissement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bien" ADD CONSTRAINT "Bien_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locataire" ADD CONSTRAINT "Locataire_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bail" ADD CONSTRAINT "Bail_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bail" ADD CONSTRAINT "Bail_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "Locataire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Echeance" ADD CONSTRAINT "Echeance_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "Bail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "Echeance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quittance" ADD CONSTRAINT "Quittance_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "Paiement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relance" ADD CONSTRAINT "Relance_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "Echeance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAction" ADD CONSTRAINT "JournalAction_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAction" ADD CONSTRAINT "JournalAction_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
