-- Lot 3 : portefeuilles (plusieurs mandats par propriétaire), permissions par module, invitations, e-mail des notifications.
ALTER TABLE "Mandat" ADD COLUMN "libelle" TEXT;

ALTER TABLE "Bien" ADD COLUMN "mandatId" TEXT;
ALTER TABLE "Bien" ADD CONSTRAINT "Bien_mandatId_fkey" FOREIGN KEY ("mandatId") REFERENCES "Mandat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Bien_mandatId_idx" ON "Bien"("mandatId");

ALTER TABLE "Membre" ADD COLUMN "modulesRefuses" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Utilisateur" ADD COLUMN "email" TEXT;
ALTER TABLE "Utilisateur" ADD COLUMN "emailNotifs" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "jetonHash" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "modulesRefuses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expireLe" TIMESTAMP(3) NOT NULL,
    "accepteeLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitation_jetonHash_key" ON "Invitation"("jetonHash");
CREATE INDEX "Invitation_organisationId_accepteeLe_idx" ON "Invitation"("organisationId", "accepteeLe");
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
