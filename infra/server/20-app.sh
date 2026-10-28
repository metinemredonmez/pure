#!/usr/bin/env bash
# 20 — Kodu GitHub'dan klonlar, YENİ sırlarla .env dosyalarını üretir.
# Eski sunucudan hiçbir .env KOPYALANMAZ: bütün sırlar burada sıfırdan üretilir.
#
#   EXPECT_COMMIT=<GitHub'da gördüğün commit kodu> sudo -E bash 20-app.sh
#
# EXPECT_COMMIT verirsen klonlanan kodun ucu bu commit değilse durur (kod bütünlüğü kontrolü).

source "$(dirname "$0")/lib.sh"
require_root

[[ -s "$SECRETS_DIR/db.password" ]] || die "Önce 10-database.sh çalıştır."
DB_PASS="$(<"$SECRETS_DIR/db.password")"

step "Kod"
install -d -m 0755 -o "$PURE_USER" -g "$PURE_USER" "$APP_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  warn "$APP_DIR zaten klonlanmış, dokunulmadı."
else
  as_pure git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi
head_commit="$(as_pure git -C "$APP_DIR" rev-parse HEAD)"
log "Kodun ucu: $head_commit"
as_pure git --no-pager -C "$APP_DIR" log -5 --format='  %h  %an  %ad  %s' --date=short
if [[ -n "${EXPECT_COMMIT:-}" && "$head_commit" != "$EXPECT_COMMIT"* ]]; then
  die "Kodun ucu beklenen commit değil (beklenen: $EXPECT_COMMIT). GitHub'daki geçmişi kontrol et."
fi

step "Altyapı script'lerini root'a ait bir dizine kopyala"
# Deploy ve bakım script'leri root yetkisiyle çalışır. Kodun bulunduğu dizin `pure`a ait ve uygulamalar
# oradan güncellenir; bir uygulama açığı o dizindeki script'i değiştirip sonraki deploy'da root olamasın.
# Bu kopya YALNIZCA root tarafından güncellenir (yeni sürümü Mac'ten gönderip yeniden kopyala).
install -d -m 0755 -o root -g root /opt/pure-infra
rsync -a --delete "$SCRIPT_DIR/" /opt/pure-infra/
chown -R root:root /opt/pure-infra
chmod -R go-w /opt/pure-infra
log "Kopyalandı: /opt/pure-infra  (deploy: sudo bash /opt/pure-infra/deploy.sh)"

step "Dizinler"
install -d -m 0755 -o "$PURE_USER" -g "$PURE_USER" "$APP_DIR/backend/uploads" "$APP_DIR/backend/uploads/images"
install -d -m 0755 -o "$PURE_USER" -g "$PURE_USER" "$LOG_DIR"
cat >/etc/logrotate.d/pure <<EOF
$LOG_DIR/*.log {
    su $PURE_USER $PURE_USER
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

# ClamAV çalışıyorsa tarama açık; yoksa kapalı (yoksa tüm yüklemeler reddedilir: upload.service.ts)
clam_enabled=false
systemctl is-active --quiet clamav-daemon && clam_enabled=true

write_file() { # yol, sahip, izin — içeriği stdin'den yazar; varsa dokunmaz
  local path="$1" owner="$2" mode="$3"
  if [[ -e "$path" ]]; then
    warn "$path zaten var, değiştirilmedi."
    cat >/dev/null
    return 0
  fi
  (umask 077 && cat >"$path")
  chown "$owner" "$path"
  chmod "$mode" "$path"
  log "Yazıldı: $path"
}

step "backend/.env (sırlar bu sunucuda üretildi)"
write_file "$APP_DIR/backend/.env" "$PURE_USER:$PURE_USER" 600 <<EOF
# 20-app.sh tarafından $(date -Is) tarihinde üretildi.
# Değeri CHANGE_ME olan satırları doldur; 30-build-start.sh doldurulmadan başlamaz.
NODE_ENV=production
PORT=4000
API_PREFIX=api
SWAGGER_ENABLED=false

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Uygulama sırları — eski sunucudakilerle ilgisi YOK, bilerek yeni.
# DİKKAT: ENCRYPTION_KEY/SALT değişirse eski veritabanındaki şifreli veriler çözülemez;
# 60-restore-data.sh sonrası reencrypt-secrets.js çalıştırılır (bkz. MIGRASYON-PLANI.md).
JWT_SECRET=$(gen_secret 48)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET=$(gen_secret 32)
WEBHOOK_SECRET=$(gen_secret 32)
ENCRYPTION_KEY=$(gen_secret 32)
ENCRYPTION_SALT=$(gen_secret 16)

CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},https://${ADMIN_DOMAIN}
FRONTEND_URL=https://${DOMAIN}
API_URL=https://${API_DOMAIN}
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Yüklenen dosyaların virüs taraması (clamd 127.0.0.1:3310)
CLAMAV_ENABLED=${clam_enabled}
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310

# ── Üçüncü taraf bilgileri: ROTASYONU YAPILMIŞ YENİ değerleri gir ──
# PROVA için (geri yüklenen veriyle başlatacaksan) SMTP_* ve PAYTR_* alanlarına gerçek değer değil
# "prova" yaz: yoksa zamanlanmış işler müşterilere e-posta gönderir ve abonelerin kartından çekim yapar.
SMTP_HOST=CHANGE_ME
SMTP_PORT=587
SMTP_USER=CHANGE_ME
SMTP_PASS=CHANGE_ME
SMTP_FROM=CHANGE_ME
CONTACT_INBOX_EMAIL=CHANGE_ME

PAYTR_MERCHANT_ID=CHANGE_ME
PAYTR_MERCHANT_KEY=CHANGE_ME
PAYTR_MERCHANT_SALT=CHANGE_ME
PAYTR_TEST_MODE=false

# İsteğe bağlı (kullanıyorsan aç):
# ANTHROPIC_API_KEY=
# GOOGLE_PLACES_API_KEY=
# GOOGLE_PLACE_ID=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=https://${API_DOMAIN}/api/auth/google/callback
EOF

step "web/.env.production ve admin/.env.production (genel değerler, gizli bilgi yok)"
write_file "$APP_DIR/web/.env.production" "$PURE_USER:$PURE_USER" 640 <<EOF
NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF
write_file "$APP_DIR/admin/.env.production" "$PURE_USER:$PURE_USER" 640 <<EOF
NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api
EOF

cat <<EOF

${c_bold}Sıradaki adım:${c_off}
  1) Eski sunucudaki backend/.env'in YALNIZCA anahtar adlarını karşılaştır (değerleri değil):
       eski sunucuda:  cut -d= -f1 /var/www/pureolentia/backend/.env | grep -v '^#' | sort
       burada:         sudo -u ${PURE_USER} cut -d= -f1 ${APP_DIR}/backend/.env | grep -v '^#' | sort
     Eskide olup burada olmayan bayrak varsa (ör. ORDER_TAX_RATE) ekle.
  2) CHANGE_ME alanlarını doldur:  sudo -u ${PURE_USER} nano ${APP_DIR}/backend/.env
EOF
