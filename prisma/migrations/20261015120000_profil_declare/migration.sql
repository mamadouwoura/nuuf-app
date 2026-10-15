-- Profil declare a l inscription (PARTICULIER ou AGENCE) : indicatif, aucun droit n en decoule.
ALTER TABLE "Organisation" ADD COLUMN "profil" TEXT;
ALTER TABLE "InscriptionEnAttente" ADD COLUMN "profil" TEXT;
