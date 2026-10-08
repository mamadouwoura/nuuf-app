import type { MetadataRoute } from "next";

/** Seules les pages publiques sont indexables ; l'espace bailleur, les liens de paiement et l'administration ne le sont jamais. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tarifs", "/legal/"],
        disallow: ["/admin", "/api/", "/paiement/", "/verifier/", "/q/", "/connexion", "/inscription", "/verification", "/mot-de-passe-oublie"],
      },
    ],
  };
}
