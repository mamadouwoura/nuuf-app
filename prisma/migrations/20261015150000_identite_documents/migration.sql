-- Identité de l'organisation sur les documents : coordonnées + logo (table séparée).
ALTER TABLE "Organisation" ADD COLUMN "adresse" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "telephonePro" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "email" TEXT;

CREATE TABLE "LogoOrganisation" (
    "organisationId" TEXT NOT NULL,
    "octets" BYTEA NOT NULL,
    "type" TEXT NOT NULL,
    "majLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogoOrganisation_pkey" PRIMARY KEY ("organisationId")
);
ALTER TABLE "LogoOrganisation" ADD CONSTRAINT "LogoOrganisation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
