// Génère une paire de clés VAPID pour les notifications push. À exécuter une seule fois, puis à renseigner dans l'hébergeur :
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (secret : ne jamais l'écrire dans le dépôt) et VAPID_SUBJECT (ex. mailto:contact@votre-domaine.sn).
import webpush from "web-push";

const cles = webpush.generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY=" + cles.publicKey);
console.log("VAPID_PRIVATE_KEY=" + cles.privateKey);
console.log("VAPID_SUBJECT=mailto:contact@exemple.sn");
