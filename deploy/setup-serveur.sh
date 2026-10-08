#!/usr/bin/env bash
# Préparation d'un serveur Ubuntu 24.04 neuf (à exécuter en root, UNE fois).
# Crée un utilisateur « deploy », verrouille SSH (clés uniquement), active le pare-feu, fail2ban,
# les mises à jour de sécurité automatiques et installe Docker.
#
# Avant de lancer : copier SA clé publique SSH dans la variable CLE_PUBLIQUE ci-dessous.
# Après : se connecter avec « ssh deploy@IP » ; la connexion root par mot de passe est désactivée.
set -euo pipefail

CLE_PUBLIQUE="${CLE_PUBLIQUE:-}"
if [ -z "$CLE_PUBLIQUE" ]; then
  echo "Définissez CLE_PUBLIQUE (contenu de votre fichier .pub) : CLE_PUBLIQUE='ssh-ed25519 AAAA…' bash setup-serveur.sh" >&2
  exit 1
fi
[ "$(id -u)" -eq 0 ] || { echo "À lancer en root." >&2; exit 1; }

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades curl ca-certificates openssl rclone

# Utilisateur d'exploitation
id deploy &>/dev/null || adduser --disabled-password --gecos "" deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "$CLE_PUBLIQUE" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

# SSH : plus de mot de passe, plus de root direct
cat > /etc/ssh/sshd_config.d/99-nuuf.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
systemctl reload ssh || systemctl reload sshd

# Pare-feu : SSH + web uniquement
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Protection contre les tentatives de connexion SSH répétées
systemctl enable --now fail2ban

# Correctifs de sécurité automatiques
dpkg-reconfigure -f noninteractive unattended-upgrades

# Docker (dépôt officiel)
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker deploy

install -d -o deploy -g deploy /opt/nuuf
echo "Serveur prêt. Connectez-vous avec : ssh deploy@<IP>   puis suivez DEPLOIEMENT.md (étape 4)."
