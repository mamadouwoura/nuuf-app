#!/usr/bin/env bash
# Sauvegarde quotidienne de la base : dump compressé + chiffré, copie hors serveur, rotation locale.
# À planifier avec cron (voir DEPLOIEMENT.md) : 0 2 * * * /opt/nuuf/deploy/backup.sh >> /var/log/nuuf-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env.production
set +a

: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE manquant dans .env.production}"
DOSSIER="backups"
HORODATAGE="$(date +%Y-%m-%d_%H%M)"
FICHIER="${DOSSIER}/nuuf_${HORODATAGE}.dump.enc"
mkdir -p "$DOSSIER"
chmod 700 "$DOSSIER"

# 1. Dump au format personnalisé (déjà compressé), chiffré en AES-256 avant d'être écrit sur disque.
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSPHRASE -out "$FICHIER"

# 1b. Photos des biens (volume « uploads »), chiffrées de la même façon.
PHOTOS="${DOSSIER}/nuuf_photos_${HORODATAGE}.tar.enc"
docker compose -f docker-compose.prod.yml exec -T app tar -C /data/uploads -cf - . \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSPHRASE -out "$PHOTOS"

# 2. Contrôle : un fichier vide ou minuscule = sauvegarde ratée.
TAILLE=$(stat -c %s "$FICHIER")
if [ "$TAILLE" -lt 1024 ]; then
  echo "ÉCHEC : sauvegarde trop petite (${TAILLE} octets)" >&2
  rm -f "$FICHIER"
  exit 1
fi
echo "Sauvegarde créée : $FICHIER (${TAILLE} octets)"

# 3. Copie hors du serveur (indispensable : un disque perdu emporte aussi les sauvegardes locales).
if [ -n "${BACKUP_RCLONE_REMOTE:-}" ]; then
  rclone copy "$FICHIER" "$BACKUP_RCLONE_REMOTE" --quiet
  rclone copy "$PHOTOS" "$BACKUP_RCLONE_REMOTE" --quiet
  echo "Copie hors serveur envoyée vers $BACKUP_RCLONE_REMOTE"
else
  echo "ATTENTION : BACKUP_RCLONE_REMOTE non défini, sauvegarde uniquement locale." >&2
fi

# 4. Rotation locale : 14 jours.
find "$DOSSIER" \( -name 'nuuf_*.dump.enc' -o -name 'nuuf_photos_*.tar.enc' \) -mtime +14 -delete
