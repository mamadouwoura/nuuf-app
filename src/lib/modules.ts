import type { Role } from "@prisma/client";
import { N_ } from "./i18n/translate";

/** Modules de l'application dont l'accès peut être retiré à un collaborateur. Le propriétaire du compte a toujours tout. */
export const MODULES = [
  { code: "PATRIMOINE", libelle: N_("Biens et locataires"), aide: N_("Biens, locataires, fiches, vérification d'un candidat"), icone: "apartment" },
  { code: "LOYERS", libelle: N_("Loyers et encaissements"), aide: N_("Paiements, quittances, relances"), icone: "account_balance_wallet" },
  { code: "GERANCE", libelle: N_("Propriétaires et bilans"), aide: N_("Propriétaires, mandats, avances, bilans"), icone: "badge" },
  { code: "TRESORERIE", libelle: N_("Trésorerie"), aide: N_("Dépenses, entrées et solde de caisse"), icone: "savings" },
  { code: "STATISTIQUES", libelle: N_("Statistiques"), aide: N_("Recouvrement, occupation, impayés"), icone: "monitoring" },
] as const;

export type CodeModule = (typeof MODULES)[number]["code"];

export const estModule = (v: string): v is CodeModule => MODULES.some((m) => m.code === v);

/** Garde uniquement les codes de modules valides (jamais de valeur libre venue d'un formulaire). */
export const modulesValides = (l: string[]): CodeModule[] => [...new Set(l)].filter(estModule);

type Droits = { role: Role; modulesRefuses: string[] };

/** Un membre accède à un module sauf s'il lui a été retiré ; le propriétaire du compte garde tout. */
export const peutAcceder = (m: Droits, module: CodeModule) => m.role === "PROPRIETAIRE" || !m.modulesRefuses.includes(module);

const CHEMINS: [string, CodeModule][] = [
  ["/biens", "PATRIMOINE"],
  ["/locataires", "PATRIMOINE"],
  ["/historique", "PATRIMOINE"],
  ["/paiements", "LOYERS"],
  ["/quittances", "LOYERS"],
  ["/relances", "LOYERS"],
  ["/proprietaires", "GERANCE"],
  ["/bilans", "GERANCE"],
  ["/tresorerie", "TRESORERIE"],
  ["/statistiques", "STATISTIQUES"],
];

/** Module qui protège un chemin d'écran (undefined si le chemin est accessible à tous). */
export const moduleDeChemin = (chemin: string): CodeModule | undefined =>
  CHEMINS.find(([p]) => chemin === p || chemin.startsWith(`${p}/`))?.[1];
