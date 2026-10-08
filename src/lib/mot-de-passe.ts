const COURANTS = new Set([
  "12345678", "123456789", "1234567890", "password", "password1", "motdepasse", "motdepasse1", "azertyui", "azerty123",
  "qwertyui", "qwerty123", "11111111", "00000000", "abcd1234", "abc12345", "iloveyou", "senegal1", "senegal123", "dakar123",
  "nuuf1234", "bienvenue", "admin123", "letmein1", "welcome1", "123123123", "987654321", "azertyuiop", "passw0rd",
]);

/** Règles minimales d'un mot de passe : retourne le message d'erreur à afficher, ou null s'il est acceptable. */
export function erreurMotDePasse(mdp: string, telephone?: string | null): string | null {
  if (mdp.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (mdp.length > 200) return "Le mot de passe est trop long.";
  const bas = mdp.toLowerCase();
  if (COURANTS.has(bas) || /^(.)\1+$/.test(mdp)) return "Ce mot de passe est trop courant. Choisissez-en un moins prévisible.";
  const chiffresTel = (telephone ?? "").replace(/\D/g, "").replace(/^221/, "");
  if (chiffresTel && mdp.replace(/\D/g, "").includes(chiffresTel)) return "Le mot de passe ne doit pas contenir votre numéro de téléphone.";
  if (!/[a-zA-Z]/.test(mdp) || !/[0-9]/.test(mdp)) {
    if (mdp.length < 12) return "Mélangez lettres et chiffres, ou choisissez une phrase d'au moins 12 caractères.";
  }
  return null;
}
