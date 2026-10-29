import { N_ } from "@/lib/i18n/translate";

/** Formules affichées sur l'accueil et sur la page Tarifs. Les prix viennent de `lib/forfaits.ts`. */
export const PLANS = [
  {
    code: "BAILLEUR" as const,
    nom: N_("Bailleur"),
    pour: N_("Propriétaires particuliers"),
    logements: N_("Jusqu'à 15 logements"),
    vedette: false,
    points: [N_("Encaissement Wave et Orange Money en 1 clic"), N_("Quittances PDF numérotées avec QR code"), N_("Relances WhatsApp en un clic"), N_("Tableau de bord et historique des loyers"), N_("1 utilisateur")],
  },
  {
    code: "PRO" as const,
    nom: "Pro",
    pour: N_("Bailleurs multi-biens avec équipe"),
    logements: N_("Jusqu'à 50 logements"),
    vedette: true,
    points: [N_("Tout le forfait Bailleur"), N_("5 accès avec rôles : propriétaire, gestionnaire, lecture seule"), N_("Journal des actions de l'équipe"), N_("Support WhatsApp prioritaire")],
  },
  {
    code: "AGENCE" as const,
    nom: N_("Agence"),
    pour: N_("Agences et cabinets de gestion"),
    logements: N_("Logements illimités"),
    vedette: false,
    points: [N_("Tout le forfait Pro"), N_("15 accès avec rôles"), N_("14 900 FCFA jusqu'à 20 logements"), N_("24 900 FCFA de 21 à 50 logements"), N_("puis 300 FCFA par logement supplémentaire")],
  },
];
