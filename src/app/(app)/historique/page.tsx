import RechercheHistorique from "@/components/RechercheHistorique";
import { getT } from "@/lib/i18n/server";
import { N_ } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t(N_("Vérifier un candidat")) };
}

export default async function Page() {
  const { t } = await getT();
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t("Vérifier un candidat")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
          {t("Avant de louer, consultez la ponctualité de paiement d'un candidat chez les autres agences et bailleurs Nuuf, avec son accord.")}
        </p>
      </div>
      <RechercheHistorique />
    </div>
  );
}
