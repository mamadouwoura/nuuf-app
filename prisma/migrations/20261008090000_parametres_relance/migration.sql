-- CreateTable
CREATE TABLE "ParametresRelance" (
    "organisationId" TEXT NOT NULL,
    "avantEcheance" BOOLEAN NOT NULL DEFAULT true,
    "apresJ1" BOOLEAN NOT NULL DEFAULT true,
    "apresJ5" BOOLEAN NOT NULL DEFAULT true,
    "canal" "CanalMessage" NOT NULL DEFAULT 'WHATSAPP',

    CONSTRAINT "ParametresRelance_pkey" PRIMARY KEY ("organisationId")
);

