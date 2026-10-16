import { createHash, randomBytes } from "node:crypto";
import { appUrl } from "./quittance";

/** Durée de validité d'un lien d'invitation. */
export const VALIDITE_INVITATION_JOURS = 7;

/** Jeton aléatoire de 256 bits : seul son empreinte est enregistrée, jamais le jeton lui-même. */
export function nouveauJeton() {
  const jeton = randomBytes(32).toString("hex");
  return { jeton, hash: hashJeton(jeton) };
}

export const hashJeton = (jeton: string) => createHash("sha256").update(jeton).digest("hex");

export const lienInvitation = (jeton: string) => `${appUrl()}/invitation/${jeton}`;

export const expirationInvitation = (now = new Date()) => new Date(now.getTime() + VALIDITE_INVITATION_JOURS * 86_400_000);

/** Une invitation est utilisable tant qu'elle n'est ni acceptée ni expirée. */
export const invitationValide = (i: { accepteeLe: Date | null; expireLe: Date }, now = new Date()) => !i.accepteeLe && i.expireLe > now;

/** Cookie éphémère qui porte le lien d'invitation jusqu'à l'écran du propriétaire (jamais dans l'URL). */
export const COOKIE_LIEN = "nuuf-invitation";
