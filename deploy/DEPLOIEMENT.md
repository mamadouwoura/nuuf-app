# Déploiement de Nuuf — guide pas à pas

## Le choix d'hébergement (décidé)

**Un serveur privé virtuel (VPS) Linux en France, avec Docker.**

| Élément | Choix | Pourquoi |
|---|---|---|
| Hébergeur | **Hostinger** (déjà utilisé pour juheccosmetic.com), emplacement **France**. Alternative équivalente : OVHcloud (Paris/Gravelines) | Un seul compte et une seule interface à maîtriser ; la France est le datacenter le plus proche de Dakar avec une bonne connectivité (environ 80 à 100 ms), contre 150 ms et plus pour d'autres régions |
| Machine | **2 vCPU, 4 Go de RAM, 50 Go de disque SSD/NVMe**, Ubuntu 24.04 | Largement suffisant pour des milliers de bailleurs ; on monte en gamme d'un clic quand il le faut |
| Pile | Docker Compose : PostgreSQL 17 + application Next.js + Caddy (HTTPS automatique) | Un seul fichier décrit tout ; mise à jour et retour arrière en une commande |
| Protection d'entrée | **Cloudflare gratuit** devant le domaine | Pare-feu applicatif, limitation de débit par IP (anti-inscriptions en masse), cache des fichiers statiques, protection contre les attaques par déluge |
| Sauvegardes | Export chiffré quotidien + copie **hors serveur** (stockage objet) | Un serveur perdu ne doit jamais emporter les données financières ; voir étape 7 |
| Nom de domaine | `nuuf.sn` (registre NIC Sénégal) ou un `.com` / `.app` | Le `.sn` inspire confiance localement ; à réserver tôt |

Coût indicatif : un VPS de cette taille coûte de l'ordre de 10 à 20 € par mois ; les sauvegardes quelques euros ;
Cloudflare gratuit. **Vérifier les tarifs actuels chez l'hébergeur avant de commander.**

Quand le volume ou les exigences montent (plusieurs centaines de bailleurs payants), prévoir une base PostgreSQL
managée avec restauration à la seconde près, ou un second serveur. Le déploiement actuel est volontairement
simple : il perd au maximum 24 h de données en cas de sinistre total (fréquence de la sauvegarde).

---

## Étape 1 — Commander le serveur
1. Créer le VPS : Ubuntu 24.04, emplacement France, 2 vCPU / 4 Go.
2. Noter l'adresse IP publique.
3. Sur votre poste, générer une clé SSH si vous n'en avez pas : `ssh-keygen -t ed25519`.
   Garder le contenu du fichier `~/.ssh/id_ed25519.pub`.

## Étape 2 — Préparer et sécuriser le serveur (une seule fois)
Copiez `deploy/setup-serveur.sh` sur le serveur, puis lancez-le en root :

```bash
scp deploy/setup-serveur.sh root@IP:/root/
ssh root@IP
CLE_PUBLIQUE='ssh-ed25519 AAAA… votre clé publique' bash /root/setup-serveur.sh
```

Le script : crée l'utilisateur `deploy`, interdit la connexion root et par mot de passe, active le pare-feu
(ports 22, 80, 443), fail2ban, les mises à jour de sécurité automatiques, installe Docker.
**Avant de fermer la session root, testez dans un second terminal : `ssh deploy@IP`.**

## Étape 3 — Domaine et DNS
1. Chez Cloudflare : ajouter le domaine, utiliser ses serveurs de noms.
2. Créer l'enregistrement `A` : `app` → IP du serveur, **nuage gris (DNS seul)** pour l'instant.
3. Après le premier démarrage (étape 5), quand le certificat est émis, passer le nuage en **orange** et régler
   Cloudflare sur **SSL/TLS : Full (strict)**.
4. Règle de limitation de débit Cloudflare conseillée : 20 requêtes par minute et par IP sur `/inscription`,
   `/connexion`, `/mot-de-passe-oublie` (les tentatives de mot de passe sont déjà limitées par compte dans
   l'application, mais pas la création de comptes en masse).

## Étape 4 — Installer l'application
```bash
ssh deploy@IP
cd /opt/nuuf
git clone <adresse-du-dépôt> .          # ou copier le dossier nuuf-app avec scp
cp deploy/env.production.example .env.production
nano .env.production                     # remplir TOUTES les valeurs (voir ci-dessous)
chmod 600 .env.production
```

Générer les secrets sur le serveur :
```bash
openssl rand -hex 24      # POSTGRES_PASSWORD
openssl rand -base64 48   # SESSION_SECRET
openssl rand -hex 32      # PAIEMENT_WEBHOOK_SECRET
openssl rand -base64 32   # BACKUP_PASSPHRASE   (à conserver AUSSI hors du serveur, sinon les sauvegardes sont illisibles)
```
`PAIEMENT_MODE` reste **vide** : sans accès Wave/Orange Money réels, aucun paiement ne peut être initié
(la simulation est interdite en production). `ADMIN_PHONES` : votre numéro au format `+221…`.

## Étape 5 — Démarrer
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml ps          # db, app, caddy « running/healthy » ; migrate « exited (0) »
curl -s https://app.votre-domaine/api/sante           # → {"ok":true}
```
La base est créée vide et les migrations appliquées automatiquement. Ouvrir le site, créer **votre** compte
(il devient le premier bailleur), puis vérifier que `/admin` s'ouvre avec votre numéro d'administrateur.

> Tant que l'envoi des codes (WhatsApp/SMS) n'est pas branché, **la connexion est impossible en production**
> (le code n'est ni affiché ni journalisé). C'est le bloquant n°1 de `LANCEMENT.md`.

## Étape 6 — Vérifications après mise en ligne
- `https://…/api/sante` renvoie `{"ok":true}`.
- En-têtes : `curl -sI https://…/connexion` montre `Strict-Transport-Security` et `Content-Security-Policy`.
- `https://…/paiement/simulation/SIM-TEST` affiche « page introuvable » (simulation désactivée).
- Un compte non administrateur obtient « page introuvable » sur `/admin`.
- Test SSL : https://www.ssllabs.com/ssltest/ (objectif A ou A+).

## Étape 7 — Sauvegardes (ne pas sauter)
```bash
# Stockage hors serveur : un bucket chez Backblaze B2, Scaleway, OVH Object Storage… puis :
rclone config                     # créer un « remote », ex. nommé « b2 »
# dans .env.production : BACKUP_RCLONE_REMOTE=b2:nuuf-sauvegardes
./deploy/backup.sh                # premier essai à la main
crontab -e                        # ajouter :
0 2 * * * /opt/nuuf/deploy/backup.sh >> /var/log/nuuf-backup.log 2>&1
```
**Test de restauration obligatoire avant le lancement** (sur un serveur de test ou une base temporaire) :
```bash
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE -in backups/nuuf_XXXX.dump.enc \
 | docker compose -f docker-compose.prod.yml exec -T db pg_restore -U nuuf -d nuuf --clean --if-exists
```
Une sauvegarde jamais restaurée n'est pas une sauvegarde.

## Mettre à jour l'application
```bash
cd /opt/nuuf && git pull
./deploy/backup.sh                                                   # sauvegarde avant chaque mise à jour
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
Les migrations s'appliquent avant le démarrage de la nouvelle version. **Retour arrière** : `git checkout <ancienne
version>` puis la même commande ; si une migration a modifié les données, restaurer d'abord la sauvegarde.

## Exploitation courante
| Besoin | Commande |
|---|---|
| Voir les journaux de l'application | `docker compose -f docker-compose.prod.yml logs -f app` |
| Redémarrer | `docker compose -f docker-compose.prod.yml restart app` |
| Espace disque | `df -h` et `docker system df` (nettoyage : `docker image prune -f`) |
| Supervision externe | créer un contrôle gratuit (UptimeRobot, Better Stack) sur `https://…/api/sante`, alerte par e-mail/WhatsApp |

## Sécurité : rappel des points non automatisables
- Ne jamais committer `.env.production` ; ne jamais ouvrir le port 5432 au public.
- Garder la phrase de passe des sauvegardes dans un gestionnaire de mots de passe, en dehors du serveur.
- Activer l'authentification à deux facteurs sur les comptes hébergeur, Cloudflare, registre de domaine, GitHub.
- Passer en `PAIEMENT_MODE=reel` uniquement après tests complets en mode sandbox des opérateurs, et configurer
  leurs webhooks vers `https://…/api/webhooks/paiement`.
