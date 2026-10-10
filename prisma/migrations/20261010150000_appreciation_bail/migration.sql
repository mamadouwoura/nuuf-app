-- Appréciation du bailleur à la fin de la location (listes fermées).
ALTER TABLE "Bail"
  ADD COLUMN "apprLogement" TEXT,
  ADD COLUMN "apprRegles" TEXT,
  ADD COLUMN "apprSortie" TEXT,
  ADD COLUMN "apprRelouer" TEXT;
