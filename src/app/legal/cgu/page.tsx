import type { Metadata } from "next";
import Link from "next/link";
import PageLegale, { EDITEUR, Section } from "@/components/PageLegale";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t(N_("Conditions d'utilisation")) };
}

export default async function Page() {
  const { t } = await getT();
  return (
    <PageLegale titre={t("Conditions générales d'utilisation")} maj={t("octobre 2026")}>
      <Section titre={t("1. Objet")}>
        <p>{t("Nuuf, édité par {editeur}, est un service en ligne de gestion locative : suivi des biens, locataires et loyers, quittances, relances et encaissement par Wave et Orange Money.", { editeur: t(EDITEUR) })}</p>
      </Section>
      <Section titre={t("2. Compte")}>
        <p>{t("Le compte est personnel et protégé par un mot de passe et un code de vérification envoyé sur votre téléphone. Vous êtes responsable de la confidentialité de vos accès et des actions de vos collaborateurs invités.")}</p>
      </Section>
      <Section titre={t("3. Essai et abonnement")}>
        <p>{t("Un essai gratuit de 14 jours est offert sans moyen de paiement. Ensuite, l'usage complet nécessite un forfait payant (voir")} <Link href="/tarifs" className="text-primary underline">{t("Tarifs")}</Link>{t("), mensuel ou annuel. Sans renouvellement, le compte passe en lecture seule après 7 jours de grâce ; vos données restent consultables.")}</p>
        <p>{t("Un changement de forfait s'applique immédiatement avec un calcul au prorata de la période restante. Les sommes déjà versées pour une période entamée ne sont pas remboursables, sauf erreur de notre part.")}</p>
      </Section>
      <Section titre={t("4. Paiements des loyers")}>
        <p>{t("Nuuf facilite l'encaissement des loyers via des opérateurs tiers (Wave, Orange Money). Les fonds transitent selon les conditions de ces opérateurs ; Nuuf n'est pas une banque. Les quittances émises attestent des paiements enregistrés dans le service.")}</p>
      </Section>
      <Section titre={t("5. Vos obligations")}>
        <p>{t("Vous garantissez l'exactitude des informations saisies, le droit de contacter vos locataires, et vous vous interdisez tout usage frauduleux ou contraire à la loi.")}</p>
      </Section>
      <Section titre={t("6. Disponibilité et responsabilité")}>
        <p>{t("Nous mettons tout en œuvre pour assurer la continuité du service, sans garantie d'absence d'interruption. Notre responsabilité est limitée aux sommes payées pour l'abonnement sur les 12 derniers mois, hors faute lourde.")}</p>
      </Section>
      <Section titre={t("7. Résiliation")}>
        <p>{t("Vous pouvez résilier à tout moment depuis Paramètres → Abonnement ; l'accès reste ouvert jusqu'à la fin de la période payée. Nous pouvons suspendre un compte en cas d'abus.")}</p>
      </Section>
      <Section titre={t("8. Données personnelles")}>
        <p>{t("Le traitement des données est décrit dans la")} <Link href="/legal/confidentialite" className="text-primary underline">{t("politique de confidentialité")}</Link>.</p>
      </Section>
      <Section titre={t("9. Droit applicable")}>
        <p>{t("Les présentes conditions sont soumises au droit sénégalais. Tout litige relève des tribunaux de Dakar, après tentative de règlement amiable.")}</p>
      </Section>
    </PageLegale>
  );
}
