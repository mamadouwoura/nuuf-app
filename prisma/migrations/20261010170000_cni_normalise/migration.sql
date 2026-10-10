-- Numéro de pièce d'identité normalisé (recherche d'historique), avec reprise des données existantes.
ALTER TABLE "Locataire" ADD COLUMN "cniNorm" TEXT;
UPDATE "Locataire"
   SET "cniNorm" = NULLIF(upper(regexp_replace("cni", '[^A-Za-z0-9]', '', 'g')), '')
 WHERE "cni" IS NOT NULL AND length(regexp_replace("cni", '[^A-Za-z0-9]', '', 'g')) >= 6;
CREATE INDEX "Locataire_cniNorm_idx" ON "Locataire"("cniNorm");
