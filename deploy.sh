#!/usr/bin/env bash
#
# Deploy script for medservice-frontend.
# Запускается на сервере 1 из /opt/medservice/medservice-frontend/.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Fail fast on missing/empty deploy config — Compose would otherwise resolve
# absent ${VARS} to empty strings and bake a broken image (localhost API URL).
if [[ ! -f .env ]]; then
    echo "[deploy] ERROR: .env not found. Copy .env.example to .env and fill it in." >&2
    exit 1
fi
set -a; source .env; set +a
: "${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL must be set in .env}"
: "${APP_DOMAIN:?APP_DOMAIN must be set in .env}"
: "${API_DOMAIN:?API_DOMAIN must be set in .env}"
: "${MINI_DOMAIN:?MINI_DOMAIN must be set in .env}"
: "${ACME_EMAIL:?ACME_EMAIL must be set in .env}"
: "${BACKEND_PRIVATE_HOST:?BACKEND_PRIVATE_HOST must be set in .env}"
: "${BACKEND_PRIVATE_PORT:?BACKEND_PRIVATE_PORT must be set in .env}"
case "${NEXT_PUBLIC_API_URL}" in
    *localhost*|*127.0.0.1*)
        echo "[deploy] ERROR: NEXT_PUBLIC_API_URL points at localhost — must be the public API domain." >&2
        exit 1 ;;
esac

echo "[deploy] pulling medservice-frontend"
git pull --ff-only

echo "[deploy] building and restarting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "[deploy] pruning old images"
docker image prune -f

echo "[deploy] done"
docker compose -f docker-compose.prod.yml ps
