import { db } from "./db";
import { telAffiche } from "./immo";

/** Taille maximale du logo : assez pour un logo net, assez petit pour des PDF légers. */
export const LOGO_MAX_OCTETS = 400 * 1024;

export type TypeLogo = "png" | "jpg";

/** Type réel de l'image d'après ses premiers octets (jamais d'après l'extension ou le type annoncé). */
export function typeDeLogo(o: Uint8Array): TypeLogo | null {
  if (o.length > 8 && o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47) return "png";
  if (o.length > 3 && o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff) return "jpg";
  return null;
}

/** Identité imprimée en tête des documents d'une organisation. */
export type Identite = {
  nom: string;
  ninea: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  logo: { octets: Uint8Array; type: TypeLogo } | null;
};

export async function chargerIdentite(organisationId: string): Promise<Identite> {
  const [org, logo] = await Promise.all([
    db.organisation.findUnique({ where: { id: organisationId }, select: { nom: true, ninea: true, adresse: true, telephonePro: true, email: true } }),
    db.logoOrganisation.findUnique({ where: { organisationId } }),
  ]);
  const type = logo ? typeDeLogo(logo.octets) : null;
  return {
    nom: org?.nom ?? "",
    ninea: org?.ninea ?? null,
    adresse: org?.adresse ?? null,
    telephone: org?.telephonePro ? telAffiche(org.telephonePro) : null,
    email: org?.email ?? null,
    logo: logo && type ? { octets: logo.octets, type } : null,
  };
}
