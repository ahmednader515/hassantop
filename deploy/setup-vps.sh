#!/usr/bin/env bash
# One-time Hostinger VPS bootstrap (Ubuntu). Run with sudo where noted.
set -euo pipefail

echo "==> Node.js 20 (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential nginx

echo "==> PM2"
sudo npm i -g pm2

echo "==> Firewall (if ufw enabled)"
sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true

echo "==> Done. Next steps:"
echo "  1. Clone/upload the app to e.g. /var/www/hassantop"
echo "  2. Create .env from .env.example (must set NEXTAUTH_URL to https://your-domain)"
echo "  3. bash deploy/deploy.sh"
echo "  4. Configure nginx from deploy/nginx.conf.example"
echo "  5. sudo certbot --nginx -d your-domain"
echo "  6. Point Hostinger DNS A record to this VPS IP"
