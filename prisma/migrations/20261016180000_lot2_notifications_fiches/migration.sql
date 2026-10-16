-- Lot 2 : notifications, préférences, fiche propriétaire enrichie, référence et mode de paiement des transactions.
ALTER TABLE "Proprietaire" ADD COLUMN "email" TEXT;
ALTER TABLE "Proprietaire" ADD COLUMN "ville" TEXT;
ALTER TABLE "Proprietaire" ADD COLUMN "personneMorale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Proprietaire" ADD COLUMN "typePiece" TEXT;
ALTER TABLE "Proprietaire" ADD COLUMN "pieceEtablieLe" TIMESTAMP(3);
ALTER TABLE "Proprietaire" ADD COLUMN "bp" TEXT;
ALTER TABLE "Proprietaire" ADD COLUMN "compteContribuable" TEXT;

ALTER TABLE "Transaction" ADD COLUMN "reference" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "modePaiement" TEXT;

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "texte" TEXT,
    "lien" TEXT,
    "luLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_utilisateurId_luLe_creeLe_idx" ON "Notification"("utilisateurId", "luLe", "creeLe");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PreferenceNotification" (
    "utilisateurId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PreferenceNotification_pkey" PRIMARY KEY ("utilisateurId", "categorie")
);
ALTER TABLE "PreferenceNotification" ADD CONSTRAINT "PreferenceNotification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
