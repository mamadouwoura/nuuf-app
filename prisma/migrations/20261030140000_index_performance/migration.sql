-- Index sur les clés étrangères et filtres fréquents (accélère les listes et les suppressions en cascade).
BEGIN;
CREATE INDEX IF NOT EXISTS "Message_organisationId_creeLe_idx" ON "Message"("organisationId", "creeLe");
CREATE INDEX IF NOT EXISTS "Bien_mandatId_idx" ON "Bien"("mandatId");
CREATE INDEX IF NOT EXISTS "Notification_organisationId_idx" ON "Notification"("organisationId");
CREATE INDEX IF NOT EXISTS "PhotoBien_organisationId_idx" ON "PhotoBien"("organisationId");
CREATE INDEX IF NOT EXISTS "DocumentLocataire_organisationId_idx" ON "DocumentLocataire"("organisationId");
CREATE INDEX IF NOT EXISTS "Reversement_organisationId_idx" ON "Reversement"("organisationId");
CREATE INDEX IF NOT EXISTS "RetenueBilan_organisationId_idx" ON "RetenueBilan"("organisationId");
CREATE INDEX IF NOT EXISTS "AvanceProprietaire_organisationId_idx" ON "AvanceProprietaire"("organisationId");
CREATE INDEX IF NOT EXISTS "RemboursementAvance_organisationId_idx" ON "RemboursementAvance"("organisationId");
COMMIT;
