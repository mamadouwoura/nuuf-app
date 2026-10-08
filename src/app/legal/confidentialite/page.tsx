import type { Metadata } from "next";
import PageLegale, { CONTACT_MAIL, EDITEUR, Section } from "@/components/PageLegale";

export const metadata: Metadata = { title: "Confidentialité" };

export default function Page() {
  return (
    <PageLegale titre="Politique de confidentialité" maj="octobre 2026">
      <Section titre="Qui est responsable de vos données ?">
        <p>{EDITEUR} est responsable du traitement des données collectées via Nuuf, conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel.</p>
      </Section>
      <Section titre="Quelles données collectons-nous ?">
        <p>Pour le bailleur : nom, numéro de téléphone, mot de passe (stocké sous forme chiffrée irréversible), informations sur l&apos;organisation.</p>
        <p>Saisies par le bailleur : biens, locataires (nom, téléphone), baux, loyers, paiements et quittances. Le bailleur est responsable de la légitimité de ces informations vis-à-vis de ses locataires.</p>
        <p>Techniques : journaux de connexion et d&apos;actions nécessaires à la sécurité.</p>
      </Section>
      <Section titre="Pourquoi ?">
        <p>Pour fournir le service : authentifier les utilisateurs, suivre les loyers, émettre des quittances, envoyer des rappels et liens de paiement, gérer l&apos;abonnement et prévenir la fraude.</p>
      </Section>
      <Section titre="Avec qui sont-elles partagées ?">
        <p>Uniquement avec nos prestataires techniques (hébergement, envoi de messages, opérateurs de paiement Wave et Orange Money) dans la mesure nécessaire au service. Nous ne vendons aucune donnée.</p>
      </Section>
      <Section titre="Combien de temps ?">
        <p>Tant que le compte est actif, puis jusqu&apos;à 5 ans pour les pièces comptables (quittances, paiements) sauf obligation légale différente. Vous pouvez demander la suppression de votre compte.</p>
      </Section>
      <Section titre="Vos droits">
        <p>Vous pouvez accéder à vos données, les corriger, vous opposer à leur traitement ou demander leur suppression{CONTACT_MAIL ? ` en écrivant à ${CONTACT_MAIL}` : " en nous contactant"}. Vous pouvez aussi saisir la Commission de Protection des Données Personnelles (CDP) du Sénégal.</p>
      </Section>
      <Section titre="Sécurité">
        <p>Connexion chiffrée (HTTPS), mots de passe hachés, codes de vérification à durée limitée, cloisonnement strict des données entre organisations et sauvegardes chiffrées.</p>
      </Section>
    </PageLegale>
  );
}
