import type { Metadata } from "next";
import PageLegale, { CONTACT_MAIL, EDITEUR, Section } from "@/components/PageLegale";

export const metadata: Metadata = { title: "Mentions légales — Nuuf" };

export default function Page() {
  return (
    <PageLegale titre="Mentions légales" maj="octobre 2026">
      <Section titre="Éditeur">
        <p>Le service Nuuf est édité par {EDITEUR}, Sénégal.</p>
        {CONTACT_MAIL && <p>Contact : {CONTACT_MAIL}</p>}
      </Section>
      <Section titre="Hébergement">
        <p>Le service est hébergé sur des serveurs situés dans l&apos;Union européenne, derrière la protection réseau de Cloudflare.</p>
      </Section>
      <Section titre="Propriété intellectuelle">
        <p>La marque Nuuf, le logo, les textes et l&apos;interface sont protégés. Toute reproduction sans autorisation est interdite. Les données saisies par l&apos;utilisateur (biens, locataires, loyers) restent sa propriété.</p>
      </Section>
    </PageLegale>
  );
}
