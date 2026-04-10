# Pure Olentia Web - Production Deploy (PM2, Docker YOK)

## Sunucu Bilgisi
- **Host:** server.pureolentia.com (213.159.6.225)
- **SSH Port:** 23422
- **User:** root
- **Hedef dizin:** `/var/www/pureolentia/web`

---

## ADIM 1: Sunucuda Dizin Hazırlığı (tek seferlik)

```bash
ssh root@213.159.6.225 -p 23422

# Dizinleri oluştur
mkdir -p /var/www/pureolentia/web
mkdir -p /var/log/pm2

# Node ve PM2 yüklü mü kontrol
node -v  # v20+ olmalı
pm2 -v
```

Eğer PM2 yoksa:
```bash
npm install -g pm2
```

---

## ADIM 2: Yerel Makinede Build

```bash
cd /Users/emre/Desktop/pure/web
npm run build
```

---

## ADIM 3: Sunucuya Upload (rsync)

```bash
# Lokal makineden çalıştır
rsync -avz --progress \
  -e "ssh -p 23422" \
  --exclude 'node_modules' \
  --exclude '.next/cache' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'DEPLOY.md' \
  /Users/emre/Desktop/pure/web/ \
  root@213.159.6.225:/var/www/pureolentia/web/
```

---

## ADIM 4: Sunucuda Kurulum

```bash
ssh root@213.159.6.225 -p 23422

cd /var/www/pureolentia/web

# Dependencies kur
npm ci

# .env.production kontrol et
cat .env.production
# Olması gereken:
# NEXT_PUBLIC_API_URL=https://api.pureolentia.com/api
# NEXT_PUBLIC_SITE_URL=https://pureolentia.com
# NODE_ENV=production

# Build (eğer lokalden göndermediysen)
npm run build
```

---

## ADIM 5: PM2 ile Başlat

```bash
cd /var/www/pureolentia/web

# İlk başlatma
pm2 start ecosystem.config.js

# Kontrol
pm2 list
pm2 logs pureolentia-web --lines 30

# Reboot sonrası otomatik başlatma
pm2 save
pm2 startup
```

---

## ADIM 6: Nginx Reverse Proxy

`/etc/nginx/sites-available/pureolentia.com` dosyasını oluştur:

```nginx
server {
    listen 80;
    server_name pureolentia.com www.pureolentia.com;
    return 301 https://pureolentia.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pureolentia.com www.pureolentia.com;

    ssl_certificate /etc/letsencrypt/live/pureolentia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pureolentia.com/privkey.pem;

    if ($host = www.pureolentia.com) {
        return 301 https://pureolentia.com$request_uri;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Static files cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /products {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifleştir:
```bash
sudo ln -s /etc/nginx/sites-available/pureolentia.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ADIM 7: SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d pureolentia.com -d www.pureolentia.com
```

---

## ADIM 8: Backend CORS'a Web Domain'i Ekle

Backend `.env` dosyasını kontrol et:
```bash
grep CORS /var/www/pureolentia/backend/.env
```

Eğer `pureolentia.com` yoksa ekle:
```bash
cd /var/www/pureolentia/backend
sed -i 's|CORS_ORIGINS=.*|CORS_ORIGINS=https://pureolentia.com,https://www.pureolentia.com,https://admin.pureolentia.com|' .env
pm2 restart pureolentia-api
```

---

## GÜNCELLEME WORKFLOW (sonradan değişiklik yaparsan)

**Lokal makinede:**
```bash
cd /Users/emre/Desktop/pure/web
npm run build

rsync -avz --progress \
  -e "ssh -p 23422" \
  --exclude 'node_modules' --exclude '.git' --exclude '.env.local' \
  /Users/emre/Desktop/pure/web/ \
  root@213.159.6.225:/var/www/pureolentia/web/
```

**Sunucuda:**
```bash
ssh root@213.159.6.225 -p 23422
cd /var/www/pureolentia/web
npm ci
npm run build
pm2 restart pureolentia-web
pm2 logs pureolentia-web --lines 20
```

---

## TROUBLESHOOTING

**502 Bad Gateway:**
```bash
pm2 logs pureolentia-web --lines 50
pm2 list
```

**Port çakışması:**
```bash
lsof -i :3000
# Eğer başka bir şey varsa ecosystem.config.js'de portu değiştir
```

**Build hatası (bellek):**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```
