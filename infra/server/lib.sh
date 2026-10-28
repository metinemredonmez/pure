#!/usr/bin/env bash
# Ortak yardımcılar. Diğer script'ler `source "$(dirname "$0")/lib.sh"` ile alır.
# Varsayılanlar ortam değişkeniyle ezilebilir: DOMAIN=ornek.com bash 20-app.sh

set -Eeuo pipefail

: "${PURE_USER:=pure}"                     # uygulamaları çalıştıran, girişi kapalı kullanıcı
: "${APP_DIR:=/var/www/pureolentia}"
: "${REPO_URL:=https://github.com/metinemredonmez/pure.git}"
: "${BRANCH:=main}"
: "${DOMAIN:=pureolentia.com}"
: "${ADMIN_DOMAIN:=admin.${DOMAIN}}"
: "${API_DOMAIN:=api.${DOMAIN}}"
: "${DB_NAME:=olentia_prod}"
: "${DB_USER:=pure_app}"
: "${SECRETS_DIR:=/etc/pure}"
: "${LOG_DIR:=/var/log/pure}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -t 1 ]]; then
  c_red=$'\033[31m'; c_green=$'\033[32m'; c_yellow=$'\033[33m'; c_bold=$'\033[1m'; c_off=$'\033[0m'
else
  c_red=''; c_green=''; c_yellow=''; c_bold=''; c_off=''
fi

log()  { printf '%s[%s]%s %s\n' "$c_green" "$(date +%H:%M:%S)" "$c_off" "$*"; }
warn() { printf '%s[UYARI]%s %s\n' "$c_yellow" "$c_off" "$*" >&2; }
die()  { printf '%s[HATA]%s %s\n' "$c_red" "$c_off" "$*" >&2; exit 1; }
step() { printf '\n%s== %s ==%s\n' "$c_bold" "$*" "$c_off"; }

trap 'die "Satır ${LINENO}: komut başarısız oldu (çıkış kodu $?). Yukarıdaki çıktıya bak."' ERR

require_root() { [[ $EUID -eq 0 ]] || die "Root yetkisi gerekli: sudo bash $0"; }

# Evet/hayır sorusu. ASSUME_YES=1 ise sormaz.
confirm() {
  [[ "${ASSUME_YES:-0}" == "1" ]] && return 0
  local ans
  read -r -p "$1 [e/H] " ans
  [[ "$ans" == "e" || "$ans" == "E" ]]
}

gen_secret() { openssl rand -hex "${1:-32}"; }

# Komutu uygulama kullanıcısı olarak çalıştırır (HOME doğru ayarlı).
as_pure() { sudo -H -u "$PURE_USER" -- "$@"; }

# .env dosyasında doldurulmamış (CHANGE_ME) alan varsa listeler ve durur.
require_env_filled() {
  local file="$1"
  [[ -f "$file" ]] || die "$file yok. Önce 20-app.sh çalıştır."
  if grep -n '=CHANGE_ME' "$file" >&2; then
    die "$file içinde doldurulmamış alanlar var (yukarıdaki satırlar). Düzenle: sudo -u $PURE_USER nano $file"
  fi
}

# Veritabanına UYGULAMA kullanıcısıyla bağlanmak için geçici .pgpass üretir ve yolunu yazdırır.
# Şifre komut satırında / ortamda görünmez. Çağıran dosyayı silmekten sorumludur.
# Süper kullanıcı (postgres) bilerek kullanılmaz: dışarıdan gelen yedeğin içindeki SQL
# `COPY ... TO PROGRAM` gibi şeylerle sunucuda komut çalıştıramasın.
db_pgpass_file() {
  local f
  f="$(mktemp)"
  chmod 600 "$f"
  printf '127.0.0.1:5432:%s:%s:%s\n' "$DB_NAME" "$DB_USER" "$(<"$SECRETS_DIR/db.password")" >"$f"
  echo "$f"
}

# Servislere sağlık isteği; birkaç denemeyle bekler.
wait_http() {
  local url="$1" tries="${2:-30}" i code
  for ((i = 1; i <= tries; i++)); do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true)"
    [[ "$code" == "200" ]] && return 0
    sleep 2
  done
  return 1
}

# ── Derleme ve başlatma (30-build-start.sh ve deploy.sh ortak kullanır) ─────────
# Derleme belleği: küçük sunucuda takılmasın diye üst sınır. BUILD_MEM_MB ile değişir.
build_node_opts() { echo "--max-old-space-size=${BUILD_MEM_MB:-3072}"; }

build_backend() {
  step "Backend: bağımlılıklar, migration, derleme"
  as_pure bash -c "cd '$APP_DIR/backend' && npm ci --no-audit --no-fund && npx prisma migrate deploy && NODE_OPTIONS='$(build_node_opts)' npm run build"
}

build_admin() {
  step "Admin: derleme"
  as_pure bash -c "cd '$APP_DIR/admin' && rm -rf .next && npm ci --no-audit --no-fund && NODE_OPTIONS='$(build_node_opts)' npm run build"
}

build_web() {
  step "Site: derleme"
  as_pure bash -c "cd '$APP_DIR/web' && rm -rf .next && npm ci --no-audit --no-fund && NODE_OPTIONS='$(build_node_opts)' npm run build"
}

pm2_start_all() {
  step "pm2: uygulamaları başlat"
  # Script'ler yönetici kullanıcının ev dizininden de çalıştırılabilir ve `pure` orayı okuyamaz;
  # bu yüzden yapılandırma pure'un kendi dizinine kopyalanır.
  local eco="/home/$PURE_USER/ecosystem.config.js"
  install -m 0644 -o "$PURE_USER" -g "$PURE_USER" "$SCRIPT_DIR/ecosystem.config.js" "$eco"
  as_pure env APP_DIR="$APP_DIR" LOG_DIR="$LOG_DIR" pm2 startOrReload "$eco" --update-env
  as_pure pm2 save
}

health_check() {
  step "Sağlık kontrolü"
  wait_http "http://127.0.0.1:4000/api/health" || die "API cevap vermiyor: sudo -u $PURE_USER pm2 logs pureolentia-api --lines 50"
  wait_http "http://127.0.0.1:3001/" || die "Site cevap vermiyor: sudo -u $PURE_USER pm2 logs pureolentia-web --lines 50"
  wait_http "http://127.0.0.1:3000/admin/login" || die "Admin cevap vermiyor: sudo -u $PURE_USER pm2 logs pureolentia-admin --lines 50"
  log "API, site ve admin yerelde cevap veriyor."
}
