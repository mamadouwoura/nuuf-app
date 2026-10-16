-- Suivi de l envoi par e-mail d une notification (evite les doublons).
ALTER TABLE "Notification" ADD COLUMN "emailEnvoyeLe" TIMESTAMP(3);
