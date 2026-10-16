import { describe, expect, it } from "vitest";
import { estVerrouillee, problemePin } from "@/lib/pin";
import { diagnostic, resteABrancher } from "@/lib/integrations";
import { messageRappel, motifRappel } from "@/lib/rappels";
import { endpointAutorise } from "@/lib/push";

describe("code PIN", () => {
  it("accepte 4 à 6 chiffres non prévisibles", () => {
    expect(problemePin("2580")).toBeNull();
    expect(problemePin("739214")).toBeNull();
    expect(problemePin("1357")).toBeNull();
  });
  it("refuse un format invalide", () => {
    for (const p of ["", "123", "1234567", "12a4", "12 34", "abcd"]) expect(problemePin(p)).toBe("format");
  });
  it("refuse les codes trop simples : chiffres répétés et suites", () => {
    for (const p of ["0000", "1111", "999999", "1234", "4321", "123456", "6543"]) expect(problemePin(p)).toBe("faible");
  });
});

describe("verrouillage après inactivité", () => {
  const maintenant = new Date("2026-10-17T10:00:00Z");
  const il_y_a = (min: number) => new Date(maintenant.getTime() - min * 60_000);
  it("ne verrouille jamais sans PIN", () => {
    expect(estVerrouillee({ pinHash: null, verrouillageMin: 1 }, il_y_a(600), maintenant)).toBe(false);
  });
  it("verrouille au-delà du délai choisi, pas avant", () => {
    const u = { pinHash: "h", verrouillageMin: 10 };
    expect(estVerrouillee(u, il_y_a(9), maintenant)).toBe(false);
    expect(estVerrouillee(u, il_y_a(11), maintenant)).toBe(true);
    expect(estVerrouillee({ pinHash: "h", verrouillageMin: 1 }, il_y_a(2), maintenant)).toBe(true);
    expect(estVerrouillee({ pinHash: "h", verrouillageMin: 30 }, il_y_a(20), maintenant)).toBe(false);
  });
  it("un délai invalide retombe sur 10 minutes", () => {
    expect(estVerrouillee({ pinHash: "h", verrouillageMin: 7 }, il_y_a(9), maintenant)).toBe(false);
    expect(estVerrouillee({ pinHash: "h", verrouillageMin: 7 }, il_y_a(11), maintenant)).toBe(true);
  });
  it("« verrouiller maintenant » (activité à l'époque) verrouille toujours", () => {
    expect(estVerrouillee({ pinHash: "h", verrouillageMin: 30 }, new Date(0), maintenant)).toBe(true);
  });
});

describe("appareils push", () => {
  it("n'accepte que les services push des navigateurs, en https", () => {
    expect(endpointAutorise("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(endpointAutorise("https://updates.push.services.mozilla.com/wpush/v2/abc")).toBe(true);
    expect(endpointAutorise("https://web.push.apple.com/abc")).toBe(true);
    expect(endpointAutorise("https://wns2-par02p.notify.windows.com/w/?token=abc")).toBe(true);
  });
  it("refuse toute autre adresse (pas de requête serveur vers un hôte arbitraire)", () => {
    for (const u of ["http://fcm.googleapis.com/x", "https://exemple.com/push", "https://evilgoogleapis.com/x", "https://fcm.googleapis.com.evil.com/x", "https://127.0.0.1/x", "file:///etc/passwd", "pas une url", ""]) {
      expect(endpointAutorise(u)).toBe(false);
    }
    expect(endpointAutorise(`https://fcm.googleapis.com/${"a".repeat(700)}`)).toBe(false);
  });
});

describe("rappels de renouvellement", () => {
  it("choisit le motif d'après l'état du compte", () => {
    expect(motifRappel("ESSAI", 3)).toBe("ESSAI_BIENTOT");
    expect(motifRappel("ESSAI", 5)).toBe("ESSAI_BIENTOT");
    expect(motifRappel("ESSAI", 6)).toBeNull();
    expect(motifRappel("ESSAI_TERMINE", 0)).toBe("ESSAI_TERMINE");
    expect(motifRappel("LECTURE_SEULE", null)).toBe("ESSAI_TERMINE");
    expect(motifRappel("GRACE", 4)).toBe("GRACE");
    expect(motifRappel("ACTIF", 20)).toBeNull();
  });
  it("rédige un message personnalisé avec le lien de choix du forfait", () => {
    const base = "https://nuuf.exemple.sn";
    expect(messageRappel({ prenom: "Awa", motif: "ESSAI_BIENTOT", jours: 2 }, base)).toBe("Bonjour Awa, votre essai gratuit Nuuf se termine dans 2 jour(s). Choisissez votre forfait pour continuer sans interruption : https://nuuf.exemple.sn/abonnement/forfait");
    expect(messageRappel({ prenom: "Awa", motif: "GRACE", jours: 5 }, base)).toContain("sous 5 jour(s)");
    expect(messageRappel({ prenom: "Awa", motif: "ESSAI_TERMINE", jours: 0 }, base)).toContain("lecture seule");
  });
});

describe("contrôle des intégrations", () => {
  const complet = {
    NODE_ENV: "production",
    APP_URL: "https://nuuf.exemple.sn",
    SESSION_SECRET: "x".repeat(40),
    PAIEMENT_MODE: "simulation",
    MESSAGERIE_MODE: "whatsapp_cloud",
    WHATSAPP_TOKEN: "t",
    WHATSAPP_PHONE_ID: "1",
    EMAIL_MODE: "resend",
    RESEND_API_KEY: "k",
    EMAIL_FROM: "Nuuf <n@x.sn>",
    VAPID_PUBLIC_KEY: "a",
    VAPID_PRIVATE_KEY: "b",
    VAPID_SUBJECT: "mailto:c@x.sn",
    CRON_SECRET: "y".repeat(30),
    ADMIN_PHONES: "+221770000000",
    NEXT_PUBLIC_CONTACT_WHATSAPP: "221770000000",
    NEXT_PUBLIC_RAISON_SOCIALE: "Nuuf SARL",
  };
  const etat = (l: ReturnType<typeof diagnostic>, code: string) => l.find((i) => i.code === code)?.etat;

  it("signale un serveur de production vide : tout ce qui bloque est à brancher", () => {
    const l = diagnostic({ NODE_ENV: "production" }, true);
    for (const code of ["url", "session", "cron", "admin", "whatsapp", "paiement"]) expect(etat(l, code)).not.toBe("ok");
    expect(resteABrancher(l)).toBeGreaterThanOrEqual(6);
  });
  it("tout est au vert sauf le paiement réel (non branché) quand le reste est configuré", () => {
    const l = diagnostic(complet, true);
    expect(etat(l, "paiement")).toBe("attention");
    expect(["url", "base", "session", "demo", "whatsapp", "email", "push", "cron", "admin", "contact", "legal"].every((c) => etat(l, c) === "ok")).toBe(true);
    expect(resteABrancher(l)).toBe(1);
  });
  it("alerte sur le mode démonstration, une adresse locale et une base muette", () => {
    const l = diagnostic({ ...complet, NUUF_DEMO: "1", APP_URL: "http://localhost:3000" }, false);
    expect(etat(l, "demo")).toBe("attention");
    expect(etat(l, "url")).toBe("attention");
    expect(etat(l, "base")).toBe("manque");
  });
  it("ne divulgue jamais la valeur d'une clé", () => {
    const texte = JSON.stringify(diagnostic({ ...complet, SESSION_SECRET: "SECRET-TRES-LONG-" + "z".repeat(30), RESEND_API_KEY: "re_cle_secrete", WHATSAPP_TOKEN: "EAAB-jeton" }, true));
    for (const secret of ["SECRET-TRES-LONG", "re_cle_secrete", "EAAB-jeton", "y".repeat(30)]) expect(texte).not.toContain(secret);
  });
});

describe("chiffrement Web Push (bibliothèque réelle, sans réseau)", () => {
  it("génère des clés VAPID et chiffre une charge pour un appareil", async () => {
    const { createECDH, randomBytes } = await import("node:crypto");
    const webpush = (await import("web-push")).default;
    const cles = webpush.generateVAPIDKeys();
    expect(cles.publicKey.length).toBeGreaterThan(60);
    webpush.setVapidDetails("mailto:test@exemple.sn", cles.publicKey, cles.privateKey);
    const navigateur = createECDH("prime256v1");
    navigateur.generateKeys();
    const abonnement = {
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: navigateur.getPublicKey().toString("base64url"), auth: randomBytes(16).toString("base64url") },
    };
    const requete = webpush.generateRequestDetails(abonnement, JSON.stringify({ titre: "Paiement reçu" }), { TTL: 3600 });
    expect(requete.endpoint).toBe(abonnement.endpoint);
    expect(String(requete.headers.Authorization)).toMatch(/^vapid /);
    expect(requete.headers["Content-Encoding"]).toBe("aes128gcm");
    expect(requete.body.length).toBeGreaterThan(40); // la charge est chiffrée, jamais en clair
    expect(requete.body.toString("utf8")).not.toContain("Paiement");
  });
});
