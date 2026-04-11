#!/bin/bash
# Automated encrypted database backup (local only)

set -e

BACKUP_DIR="/var/lib/tarbutrm/backups"
MAX_VERSIONS=10

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Dump production database
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/tarbutrm_prod_$TIMESTAMP.sql"
ENCRYPTED_FILE="$BACKUP_DIR/tarbutrm_prod_$TIMESTAMP.gpg"

echo "[$(date)] Starting database backup..."

# Dump database
docker exec tarbutrm-db-1 pg_dump -U postgres tarbutrm_prod > "$BACKUP_FILE" 2>/dev/null

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[$(date)] ERROR: Failed to dump database"
  exit 1
fi

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Database dumped successfully ($SIZE)"

# Encrypt with GPG (symmetric, AES256)
if [ -z "$BACKUP_PASSPHRASE" ]; then
  echo "[$(date)] ERROR: BACKUP_PASSPHRASE not set"
  rm "$BACKUP_FILE"
  exit 1
fi

echo "$BACKUP_PASSPHRASE" | gpg --batch --yes --passphrase-fd 0 \
  --symmetric --cipher-algo AES256 \
  --output "$ENCRYPTED_FILE" "$BACKUP_FILE"

rm "$BACKUP_FILE"

if [ ! -f "$ENCRYPTED_FILE" ]; then
  echo "[$(date)] ERROR: Failed to encrypt backup"
  exit 1
fi

ENC_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
echo "[$(date)] Backup encrypted successfully ($ENC_SIZE) → $ENCRYPTED_FILE"

# Keep only last N versions
echo "[$(date)] Cleaning up old backups (keeping last $MAX_VERSIONS versions)..."
ls -1 "$BACKUP_DIR"/tarbutrm_prod_*.gpg 2>/dev/null | sort -r | tail -n +$((MAX_VERSIONS + 1)) | while read file; do
  rm "$file"
  echo "[$(date)] Removed old backup: $(basename $file)"
done

echo "[$(date)] Backup complete ✓"
