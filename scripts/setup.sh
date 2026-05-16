#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies..."
npm install --prefix backend
npm install --prefix frontend

echo "==> Starting Docker..."
docker compose up -d
sleep 8

echo "==> Migrating & seeding..."
npm run prisma:deploy --prefix backend
npm run prisma:seed --prefix backend

echo ""
echo "Done! Run: npm run dev:api  and  npm run dev:web"
