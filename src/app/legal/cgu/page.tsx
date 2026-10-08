import type { Metadata } from "next";
import Link from "next/link";
import PageLegale, { EDITEUR, Section } from "@/components/PageLegale";

export const metadata: Metadata = { title: "Conditions d'utilisation — Nuuf" };

export default function Page() {
  return (
    <PageLegale titre="Conditions générales d'utilisation" maj="octobre 2026">
      <Section titre="1. Objet">
        <p>Nuuf, édité par {EDITEUR}, est un service en ligne de gestion locative : suivi des biens, locataires et loyers, quittances, relances et encaissement par Wave et Orange Money.</p>
      </Section>
      <Section titre="2. Compte">
        <p>Le compte est personnel et protégé par un mot de passe et un code de vérification envoyé sur votre téléphone. Vous êtes responsable de la confidentialité de vos accès et des actions de vos collaborateurs invités.</p>
      </Section>
      <Section titre="3. Essai et abonnement">
        <p>Un essai gratuit de 14 jours est offert sans moyen de paiement. Ensuite, l&apos;usage complet nécessite un forfait payant (voir <Link href="/tarifs" className="text-primary underline">Tarifs</Link>), mensuel ou annuel. Sans renouvellement, le compte passe en lecture seule après 7 jours de grâce ; vos données restent consultables.</p>
        <p>Un changement de forfait s&apos;applique immédiatement avec un calcul au prorata de la période restante. Les sommes déjà versées pour une période entamée ne sont pas remboursables, sauf erreur de notre part.</p>
      </Section>
      <Section titre="4. Paiements des loyers">
        <p>Nuuf facilite l&apos;encaissement des loyers via des opérateurs tiers (Wave, Orange Money). Les fonds transitent selon les conditions de ces opérateurs ; Nuuf n&apos;est pas une banque. Les quittances émises attestent des paiements enregistrés dans le service.</p>
      </Section>
      <Section titre="5. Vos obligations">
        <p>Vous garantissez l&apos;exactitude des informations saisies, le droit de contacter vos locataires, et vous vous interdisez tout usage frauduleux ou contraire à la loi.</p>
      </Section>
      <Section titre="6. Disponibilité et responsabilité">
        <p>Nous mettons tout en œuvre pour assurer la continuité du service, sans garantie d&apos;absence d&apos;interruption. Notre responsabilité est limitée aux sommes payées pour l&apos;abonnement sur les 12 derniers mois, hors faute lourde.</p>
      </Section>
      <Section titre="7. Résiliation">
        <p>Vous pouvez résilier à tout moment depuis Paramètres → Abonnement ; l&apos;accès reste ouvert jusqu&apos;à la fin de la période payée. Nous pouvons suspendre un compte en cas d&apos;abus.</p>
      </Section>
      <Section titre="8. Données personnelles">
        <p>Le traitement des données est décrit dans la <Link href="/legal/confidentialite" className="text-primary underline">politique de confidentialité</Link>.</p>
      </Section>
      <Section titre="9. Droit applicable">
        <p>Les présentes conditions sont soumises au droit sénégalais. Tout litige relève des tribunaux de Dakar, après tentative de règlement amiable.</p>
      </Section>
    </PageLegale>
  );
}
