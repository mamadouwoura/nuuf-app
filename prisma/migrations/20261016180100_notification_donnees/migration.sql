-- Variables du message (montant, nom...) : le texte est traduit a l affichage.
ALTER TABLE "Notification" ADD COLUMN "donnees" JSONB;
