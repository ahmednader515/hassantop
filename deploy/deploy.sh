#!/usr/bin/env bash
# Hostinger VPS one-time / update deploy for this Next.js app.
# Run from the app directory on the server as the app user (not root for npm).
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> App dir: $APP_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy from .env.example and fill production values."
  exit 1
fi

if ! grep -q '^NEXTAUTH_URL=https\?://' .env; then
  echo "WARNING: Set NEXTAUTH_URL to your public URL, e.g. https://yourdomain.com"
fi

echo "==> Installing dependencies"
npm ci

echo "==> Prisma generate"
npx prisma generate

echo "==> Building"
npm run build

if command -v pm2 >/dev/null 2>&1; then
  echo "==> Restarting PM2"
  if pm2 describe hassantop >/dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
  echo "==> Done. Check: pm2 status && curl -I http://127.0.0.1:3000"
else
  echo "PM2 not found. Install: sudo npm i -g pm2"
  echo "Then: pm2 start ecosystem.config.cjs && pm2 save && pm2 startup"
fi
