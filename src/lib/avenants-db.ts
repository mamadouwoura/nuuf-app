import { Prisma } from "@prisma/client";
import { db } from "./db";
import { assurerEcheances, debutMois } from "./loyers";
import type { AvenantValide } from "./avenants";

/**
 * Enregistre un avenant (numéro suivant du bail) et applique ses effets : nouveau loyer sur les échéances à venir
 * non réglées, ou nouvelle date de fin du bail. Renvoie le numéro, ou null si un autre avenant vient d'être créé en même temps.
 */
export async function enregistrerAvenant(p: { bailId: string; organisationId: string; utilisateurId: string; avenant: AvenantValide; now: Date }): Promise<number | null> {
  const a = p.avenant;
  // L'échéance du mois en cours doit exister avec l'ancien loyer avant que le bail ne porte le nouveau (effet le mois suivant).
  if (a.type === "LOYER") await assurerEcheances(p.organisationId, debutMois(p.now));
  try {
    return await db.$transaction(async (tx) => {
      const dernier = await tx.avenant.findFirst({ where: { bailId: p.bailId }, orderBy: { numero: "desc" }, select: { numero: true } });
      const numero = (dernier?.numero ?? 0) + 1;
      await tx.avenant.create({ data: { bailId: p.bailId, numero, ...a } });
      if (a.type === "LOYER" && a.nouveauLoyer) {
        await tx.bail.update({ where: { id: p.bailId }, data: { loyerMensuel: a.nouveauLoyer } });
        await tx.echeance.updateMany({
          where: { bailId: p.bailId, mois: { gte: a.effetLe }, statut: { not: "PAYEE" }, paiements: { none: { statut: "CONFIRME" } } },
          data: { montantDu: a.nouveauLoyer },
        });
      } else if (a.type === "DUREE") {
        await tx.bail.update({ where: { id: p.bailId }, data: { finLe: a.nouvelleFinLe } });
      }
      await tx.journalAction.create({ data: { organisationId: p.organisationId, utilisateurId: p.utilisateurId, action: `avenant.${a.type.toLowerCase()}`, cible: p.bailId } });
      return numero;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return null;
    throw e;
  }
}
