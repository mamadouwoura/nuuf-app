import type { Metadata } from "next";
import PageLegale, { CONTACT_MAIL, EDITEUR, Section } from "@/components/PageLegale";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t(N_("Mentions légales")) };
}

export default async function Page() {
  const { t } = await getT();
  return (
    <PageLegale titre={t("Mentions légales")} maj={t("octobre 2026")}>
      <Section titre={t("Éditeur")}>
        <p>{t("Le service Nuuf est édité par {editeur}, Sénégal.", { editeur: t(EDITEUR) })}</p>
        {CONTACT_MAIL && <p>{t("Contact : {mail}", { mail: CONTACT_MAIL })}</p>}
      </Section>
      <Section titre={t("Hébergement")}>
        <p>{t("Le service est hébergé sur des serveurs situés dans l'Union européenne, derrière la protection réseau de Cloudflare.")}</p>
      </Section>
      <Section titre={t("Propriété intellectuelle")}>
        <p>{t("La marque Nuuf, le logo, les textes et l'interface sont protégés. Toute reproduction sans autorisation est interdite. Les données saisies par l'utilisateur (biens, locataires, loyers) restent sa propriété.")}</p>
      </Section>
    </PageLegale>
  );
}
