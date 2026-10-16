import { redirect } from "next/navigation";
import { getUser } from "./session";
import { peutAcceder, type CodeModule } from "./modules";

export * from "./modules";

/** À appeler en tête d'un écran réservé : renvoie l'utilisateur, ou redirige vers « accès refusé ». */
export async function exigerModule(module: CodeModule) {
  const user = await getUser();
  if (!user) redirect("/connexion");
  const membre = user.membres[0];
  if (!membre) redirect("/connexion");
  if (!peutAcceder(membre, module)) redirect(`/acces-refuse?module=${module}`);
  return user;
}

/** Variante pour les routes de téléchargement : renvoie une réponse 403 plutôt que de rediriger. */
export async function refuseSiModule(module: CodeModule) {
  const user = await getUser();
  const membre = user?.membres[0];
  if (!user || !membre) return { user: null, reponse: new Response("Non autorisé", { status: 401 }) };
  if (!peutAcceder(membre, module)) return { user, reponse: new Response("Accès refusé à ce module.", { status: 403 }) };
  return { user, reponse: null };
}
