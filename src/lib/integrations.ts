import { N_ } from "./i18n/translate";

export type EtatIntegration = "ok" | "attention" | "manque";

export type Integration = {
  code: string;
  nom: string;
  etat: EtatIntegration;
  /** Ce qui est constaté, en une phrase (jamais de valeur secrète) ; modèle traduit à l'affichage. */
  detail: string;
  vars?: Record<string, string | number>;
  /** Variables d'environnement concernées. */
  variables: string[];
  /** Vrai si cette ligne bloque l'ouverture à de vrais clients. */
  bloquant: boolean;
};

type Env = Record<string, string | undefined>;

const present = (v: string | undefined, min = 1) => (v ?? "").trim().length >= min;

/**
 * État de chaque service dont Nuuf dépend, d'après les variables d'environnement : l'administrateur voit d'un coup
 * d'œil ce qui reste à brancher avant l'ouverture. Seul l'état est exposé, jamais la valeur d'une clé.
 */
export function diagnostic(env: Env, baseJoignable: boolean): Integration[] {
  const prod = env.NODE_ENV === "production";
  const l: Integration[] = [];
  const ajouter = (i: Integration) => l.push(i);

  const url = env.APP_URL ?? "";
  ajouter(
    !present(url)
      ? { code: "url", nom: N_("Adresse publique du site"), etat: "manque", detail: N_("APP_URL n'est pas renseignée : les liens envoyés (paiement, invitation, quittance) pointeront vers le mauvais site."), variables: ["APP_URL"], bloquant: true }
      : !/^https:\/\//.test(url) || /localhost|127\.0\.0\.1/.test(url)
        ? { code: "url", nom: N_("Adresse publique du site"), etat: "attention", detail: N_("L'adresse n'est pas une adresse https publique."), variables: ["APP_URL"], bloquant: true }
        : { code: "url", nom: N_("Adresse publique du site"), etat: "ok", detail: N_("Adresse https renseignée."), variables: ["APP_URL"], bloquant: true },
  );

  ajouter({ code: "base", nom: N_("Base de données"), etat: baseJoignable ? "ok" : "manque", detail: baseJoignable ? N_("La base répond.") : N_("La base ne répond pas."), variables: ["DATABASE_URL"], bloquant: true });

  const secretSession = present(env.SESSION_SECRET, 32);
  ajouter({ code: "session", nom: N_("Clé des sessions"), etat: secretSession ? "ok" : "manque", detail: secretSession ? N_("Clé de 32 caractères ou plus.") : N_("SESSION_SECRET est absente ou trop courte (32 caractères minimum)."), variables: ["SESSION_SECRET"], bloquant: true });

  ajouter({
    code: "demo",
    nom: N_("Mode démonstration"),
    etat: env.NUUF_DEMO === "1" ? "attention" : "ok",
    detail: env.NUUF_DEMO === "1" ? N_("Les codes de connexion s'affichent à l'écran : à désactiver avant d'accueillir de vrais clients.") : N_("Désactivé : les codes de connexion sont envoyés par message."),
    variables: ["NUUF_DEMO"],
    bloquant: true,
  });

  const modePaiement = env.PAIEMENT_MODE ?? (prod ? "" : "simulation");
  ajouter({
    code: "paiement",
    nom: N_("Paiement Wave et Orange Money"),
    etat: modePaiement === "simulation" ? "attention" : "manque",
    detail:
      modePaiement === "simulation"
        ? N_("Mode simulation : aucun argent réel ne circule. Le branchement aux opérateurs reste à faire (accès marchands requis).")
        : N_("Passerelle réelle non branchée : les paiements en ligne sont refusés tant qu'elle n'est pas configurée."),
    variables: ["PAIEMENT_MODE", "PAIEMENT_WEBHOOK_SECRET"],
    bloquant: true,
  });

  const modeMsg = env.MESSAGERIE_MODE ?? (prod ? "desactive" : "simulation");
  const waOk = present(env.WHATSAPP_TOKEN) && present(env.WHATSAPP_PHONE_ID);
  ajouter({
    code: "whatsapp",
    nom: N_("Messages WhatsApp (codes, relances, liens)"),
    etat: modeMsg === "whatsapp_cloud" ? (waOk ? "ok" : "manque") : modeMsg === "simulation" ? "attention" : "manque",
    detail:
      modeMsg === "whatsapp_cloud"
        ? waOk ? N_("WhatsApp Cloud API configurée.") : N_("Mode WhatsApp activé mais le jeton ou le numéro d'envoi manque.")
        : modeMsg === "simulation" ? N_("Mode simulation : aucun message ne part.") : N_("Désactivé : aucun message ne part, pas même les codes de connexion."),
    variables: ["MESSAGERIE_MODE", "WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"],
    bloquant: true,
  });

  const modeEmail = env.EMAIL_MODE ?? (prod ? "desactive" : "simulation");
  const emailOk = present(env.RESEND_API_KEY) && present(env.EMAIL_FROM);
  ajouter({
    code: "email",
    nom: N_("E-mail des notifications"),
    etat: modeEmail === "resend" ? (emailOk ? "ok" : "manque") : modeEmail === "simulation" ? "attention" : "manque",
    detail:
      modeEmail === "resend"
        ? emailOk ? N_("Service d'envoi configuré.") : N_("Mode e-mail activé mais la clé ou l'adresse d'expédition manque.")
        : modeEmail === "simulation" ? N_("Mode simulation : aucun e-mail ne part.") : N_("Désactivé : les notifications restent dans l'application."),
    variables: ["EMAIL_MODE", "RESEND_API_KEY", "EMAIL_FROM"],
    bloquant: false,
  });

  const pushOk = present(env.VAPID_PUBLIC_KEY) && present(env.VAPID_PRIVATE_KEY) && present(env.VAPID_SUBJECT);
  ajouter({
    code: "push",
    nom: N_("Notifications push"),
    etat: pushOk ? "ok" : "manque",
    detail: pushOk ? N_("Clés VAPID configurées.") : N_("Clés VAPID absentes : générez-les avec « npm run vapid » puis renseignez-les."),
    variables: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"],
    bloquant: false,
  });

  const cronOk = present(env.CRON_SECRET, 24);
  ajouter({
    code: "cron",
    nom: N_("Tâches planifiées (relances, échéances)"),
    etat: cronOk ? "ok" : "manque",
    detail: cronOk ? N_("Secret en place : le planificateur peut appeler /api/cron/relances chaque jour.") : N_("CRON_SECRET est absent ou trop court (24 caractères minimum) : les relances automatiques ne partiront pas."),
    variables: ["CRON_SECRET"],
    bloquant: true,
  });

  const admins = (env.ADMIN_PHONES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  ajouter({ code: "admin", nom: N_("Administrateurs"), etat: admins.length ? "ok" : "manque", detail: admins.length ? N_("{n} numéro(s) administrateur(s).") : N_("Aucun numéro d'administrateur (ADMIN_PHONES)."), vars: { n: admins.length }, variables: ["ADMIN_PHONES"], bloquant: true });

  const contact = present(env.NEXT_PUBLIC_CONTACT_WHATSAPP);
  ajouter({ code: "contact", nom: N_("Contact support"), etat: contact ? "ok" : "attention", detail: contact ? N_("Numéro WhatsApp de support affiché dans l'application.") : N_("Aucun numéro de support affiché aux clients (NEXT_PUBLIC_CONTACT_WHATSAPP)."), variables: ["NEXT_PUBLIC_CONTACT_WHATSAPP", "NEXT_PUBLIC_CONTACT_EMAIL"], bloquant: false });

  const raison = present(env.NEXT_PUBLIC_RAISON_SOCIALE);
  ajouter({ code: "legal", nom: N_("Mentions légales"), etat: raison ? "ok" : "attention", detail: raison ? N_("Raison sociale renseignée.") : N_("La raison sociale n'est pas renseignée : les mentions légales sont incomplètes."), variables: ["NEXT_PUBLIC_RAISON_SOCIALE"], bloquant: true });

  return l;
}

/** Résumé : combien de lignes bloquantes ne sont pas au vert. */
export const resteABrancher = (l: Integration[]) => l.filter((i) => i.bloquant && i.etat !== "ok").length;
