#!/usr/bin/env bash
#
# Deploy script for medservice-frontend.
# Запускается на сервере 1 из /opt/medservice/medservice-frontend/.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "[deploy] pulling medservice-frontend"
git pull --ff-only

echo "[deploy] building and restarting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "[deploy] pruning old images"
docker image prune -f

echo "[deploy] done"
docker compose -f docker-compose.prod.yml ps
