# Deploy this Next.js app on a Hostinger VPS

## Prerequisites
- Ubuntu VPS with root/SSH access
- Domain A record pointing to the VPS IP
- Neon Postgres credentials (already used locally)

## 1. Bootstrap the server (once)
```bash
# after uploading/cloning the repo
chmod +x deploy/setup-vps.sh deploy/deploy.sh
sudo bash deploy/setup-vps.sh
```

## 2. Configure environment
```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `DATABASE_URL` / `DIRECT_DATABASE_URL` (Neon)
- `NEXTAUTH_URL=https://your-domain.com`  ← must be the public URL
- `NEXTAUTH_SECRET` (long random string)
- UploadThing keys if you use uploads

## 3. Build & start with PM2
```bash
bash deploy/deploy.sh
# or: npm run deploy:vps
```

## 4. Nginx + HTTPS
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/hassantop
sudo nano /etc/nginx/sites-available/hassantop   # replace YOUR_DOMAIN
sudo ln -sf /etc/nginx/sites-available/hassantop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 5. Updates later
```bash
git pull   # or upload new files
bash deploy/deploy.sh
```

## Checklist if something fails
| Symptom | Fix |
|---|---|
| Login redirects to localhost | Set `NEXTAUTH_URL=https://your-domain.com` and `pm2 reload ecosystem.config.cjs --update-env` |
| 502 Bad Gateway | `pm2 status` — app must listen on `127.0.0.1:3000` |
| Server Actions blocked | Add domain to `NEXTAUTH_URL` / `ALLOWED_ORIGINS` |
| Prisma errors | `npx prisma generate` then rebuild |
| Google login broken | Add `https://your-domain.com/api/auth/callback/google` in Google Cloud Console |
