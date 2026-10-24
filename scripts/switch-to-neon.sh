#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# BASCULE VERS LA BASE NEON (PostgreSQL « SermaHub ») — Groupe SERMA
#
# Usage :
#   ./scripts/switch-to-neon.sh "postgresql://neondb_owner:MOTDEPASSE@ep-xxxx-pooler.region.aws.neon.tech/SermaHub?sslmode=require&pgbouncer=true" "postgresql://neondb_owner:MOTDEPASSE@ep-xxxx.region.aws.neon.tech/SermaHub?sslmode=require"
#
# Ce script :
#   1. écrit les URLs dans .env (SERMAHUB_DATABASE_URL + SERMAHUB_DIRECT_URL) ;
#   2. régénère le client Prisma PostgreSQL (schéma principal) ;
#   3. relance un build de production et redémarre le serveur.
#
# Sans argument : affiche cette aide.
# Pour revenir au miroir local SQLite : supprimez simplement les deux
# lignes SERMAHUB_* de .env puis relancez `bun run build && bun run start`.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

URL="${1:-}"
DIRECT="${2:-$URL}"

if [ -z "$URL" ]; then
  head -20 "$0" | tail -16
  exit 0
fi

cd "$(dirname "$0")/.."

echo "→ Écriture des URLs Neon dans .env…"
python3 - "$URL" "$DIRECT" <<'PY'
import sys, re
pooler, direct = sys.argv[1], sys.argv[2]
env = open(".env").read()
env = re.sub(r"#?\s*SERMAHUB_DATABASE_URL=.*", f"SERMAHUB_DATABASE_URL={pooler}", env)
if "SERMAHUB_DATABASE_URL=" not in env:
    env += f"\nSERMAHUB_DATABASE_URL={pooler}\n"
env = re.sub(r"#?\s*SERMAHUB_DIRECT_URL=.*", f"SERMAHUB_DIRECT_URL={direct}", env)
if "SERMAHUB_DIRECT_URL=" not in env:
    env += f"SERMAHUB_DIRECT_URL={direct}\n"
open(".env", "w").write(env)
PY

echo "→ Régénération du client Prisma (PostgreSQL)…"
bunx prisma generate

echo "→ Build de production…"
bun run build

echo "→ Redémarrage du serveur…"
pkill -f "standalone/server.js" 2>/dev/null || true
sleep 1
(DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | cut -d= -f2-)" \
 BO_SESSION_SECRET="$(grep -E '^BO_SESSION_SECRET=' .env | cut -d= -f2-)" \
 NODE_ENV=production nohup bun .next/standalone/server.js > server.log 2>&1 < /dev/null &)

sleep 4
curl -s -o /dev/null -w "Serveur relancé : %{http_code}\n" http://localhost:3000/ || true
echo "✔ Base Neon active — les vraies données du cabinet sont de retour."
