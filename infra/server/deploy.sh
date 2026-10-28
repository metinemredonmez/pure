#!/usr/bin/env bash
# Güncelleme: GitHub'dan çek → derle → yeniden başlat. Her adım ayrı satırdadır ve biri
# hata verirse script durur (eski sunucuda `git pull` sessizce başarısız olup eski kodla
# build alınmıştı; bu script bunu yapmaz).
#
#   sudo bash /opt/pure-infra/deploy.sh
#
# Bu script root'a ait /opt/pure-infra altından çalışır (kod dizini pure'a aittir; oradan root script'i
# çalıştırmak, bir uygulama açığının root'a dönüşmesine yol açabilirdi).
#
# Admin ve site derlenirken ilgili uygulama birkaç dakika cevap vermez (.next silinip yeniden
# oluşturulur): düşük trafikli bir saatte çalıştır.

source "$(dirname "$0")/lib.sh"
require_root

cd "$APP_DIR"

step "Kod bütünlüğü"
# Sunucuda kodda elle değişiklik OLMAMALI. Lock dosyaları dışında bir fark kurcalama belirtisidir.
dirty="$(as_pure git status --porcelain --untracked-files=no | grep -v -E '(package-lock\.json|yarn\.lock)$' || true)"
if [[ -n "$dirty" ]]; then
  printf '%s\n' "$dirty"
  die "Sunucudaki kod GitHub'dakinden farklı (yukarıdaki dosyalar). Kurcalanmış olabilir: 'git diff' ile bak, sonra karar ver."
fi
as_pure git checkout -- admin/yarn.lock admin/package-lock.json backend/package-lock.json web/package-lock.json 2>/dev/null || true

step "Kodu çek"
old="$(as_pure git rev-parse HEAD)"
as_pure git fetch --quiet origin "$BRANCH"
as_pure git merge --ff-only "origin/$BRANCH"
new="$(as_pure git rev-parse HEAD)"
if [[ "$old" == "$new" && "${FORCE:-0}" != "1" ]]; then
  log "Zaten güncel ($new). Yine de derlemek için: FORCE=1 sudo -E bash $0"
  exit 0
fi
log "Güncellenen commit'ler:"
as_pure git --no-pager log --format='  %h  %s' "$old..$new"

build_backend
as_pure pm2 reload pureolentia-api --update-env

build_admin
as_pure pm2 restart pureolentia-admin --update-env

build_web
as_pure pm2 restart pureolentia-web --update-env

as_pure pm2 save
health_check
log "Deploy tamam: $(as_pure git rev-parse --short HEAD)"
