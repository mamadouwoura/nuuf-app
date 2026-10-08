import type { Metadata } from "next";
import PageLegale, { CONTACT_MAIL, EDITEUR, Section } from "@/components/PageLegale";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t(N_("Confidentialité")) };
}

export default async function Page() {
  const { t } = await getT();
  return (
    <PageLegale titre={t("Politique de confidentialité")} maj={t("octobre 2026")}>
      <Section titre={t("Qui est responsable de vos données ?")}>
        <p>{t("{editeur} est responsable du traitement des données collectées via Nuuf, conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel.", { editeur: t(EDITEUR) })}</p>
      </Section>
      <Section titre={t("Quelles données collectons-nous ?")}>
        <p>{t("Pour le bailleur : nom, numéro de téléphone, mot de passe (stocké sous forme chiffrée irréversible), informations sur l'organisation.")}</p>
        <p>{t("Saisies par le bailleur : biens, locataires (nom, téléphone), baux, loyers, paiements et quittances. Le bailleur est responsable de la légitimité de ces informations vis-à-vis de ses locataires.")}</p>
        <p>{t("Techniques : journaux de connexion et d'actions nécessaires à la sécurité.")}</p>
      </Section>
      <Section titre={t("Pourquoi ?")}>
        <p>{t("Pour fournir le service : authentifier les utilisateurs, suivre les loyers, émettre des quittances, envoyer des rappels et liens de paiement, gérer l'abonnement et prévenir la fraude.")}</p>
      </Section>
      <Section titre={t("Avec qui sont-elles partagées ?")}>
        <p>{t("Uniquement avec nos prestataires techniques (hébergement, envoi de messages, opérateurs de paiement Wave et Orange Money) dans la mesure nécessaire au service. Nous ne vendons aucune donnée.")}</p>
      </Section>
      <Section titre={t("Combien de temps ?")}>
        <p>{t("Tant que le compte est actif, puis jusqu'à 5 ans pour les pièces comptables (quittances, paiements) sauf obligation légale différente. Vous pouvez demander la suppression de votre compte.")}</p>
      </Section>
      <Section titre={t("Vos droits")}>
        <p>{CONTACT_MAIL ? t("Vous pouvez accéder à vos données, les corriger, vous opposer à leur traitement ou demander leur suppression en écrivant à {mail}.", { mail: CONTACT_MAIL }) : t("Vous pouvez accéder à vos données, les corriger, vous opposer à leur traitement ou demander leur suppression en nous contactant.")} {t("Vous pouvez aussi saisir la Commission de Protection des Données Personnelles (CDP) du Sénégal.")}</p>
      </Section>
      <Section titre={t("Sécurité")}>
        <p>{t("Connexion chiffrée (HTTPS), mots de passe hachés, codes de vérification à durée limitée, cloisonnement strict des données entre organisations et sauvegardes chiffrées.")}</p>
      </Section>
    </PageLegale>
  );
}
