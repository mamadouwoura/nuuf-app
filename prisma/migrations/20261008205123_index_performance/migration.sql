-- CreateIndex
CREATE INDEX "CompteEncaissement_organisationId_idx" ON "CompteEncaissement"("organisationId");

-- CreateIndex
CREATE INDEX "Echeance_dateLimite_statut_idx" ON "Echeance"("dateLimite", "statut");

-- CreateIndex
CREATE INDEX "FactureAbonnement_abonnementId_idx" ON "FactureAbonnement"("abonnementId");

-- CreateIndex
CREATE INDEX "Membre_utilisateurId_idx" ON "Membre"("utilisateurId");

-- CreateIndex
CREATE INDEX "Message_type_creeLe_idx" ON "Message"("type", "creeLe");

-- CreateIndex
CREATE INDEX "Paiement_echeanceId_idx" ON "Paiement"("echeanceId");

-- CreateIndex
CREATE INDEX "Paiement_statut_creeLe_idx" ON "Paiement"("statut", "creeLe");

-- CreateIndex
CREATE INDEX "Quittance_organisationId_emiseLe_idx" ON "Quittance"("organisationId", "emiseLe");

-- CreateIndex
CREATE INDEX "Relance_echeanceId_idx" ON "Relance"("echeanceId");

