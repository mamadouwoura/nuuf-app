-- Fiche de renseignement du locataire (remplie par l'agent) + signature à l'écran.
ALTER TABLE "Locataire"
  ADD COLUMN "dateNaissance" TIMESTAMP(3),
  ADD COLUMN "lieuNaissance" TEXT,
  ADD COLUMN "dernierDomicile" TEXT,
  ADD COLUMN "contactUrgenceNom" TEXT,
  ADD COLUMN "contactUrgenceTel" TEXT,
  ADD COLUMN "situationFamiliale" TEXT,
  ADD COLUMN "enfantsMineurs" INTEGER,
  ADD COLUMN "enfantsMajeurs" INTEGER,
  ADD COLUMN "statutPro" TEXT,
  ADD COLUMN "lieuTravail" TEXT,
  ADD COLUMN "justificatifs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "ficheRemplieLe" TIMESTAMP(3),
  ADD COLUMN "consentementHistoriqueLe" TIMESTAMP(3),
  ADD COLUMN "signature" TEXT,
  ADD COLUMN "signeLe" TIMESTAMP(3);
