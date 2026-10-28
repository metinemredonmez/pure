#!/usr/bin/env bash
# 30 — Üç uygulamayı derler (migration dahil) ve pm2 ile başlatır; açılışta otomatik başlar.
#
#   sudo bash 30-build-start.sh
#
# Veriyi geri yüklemeyi (60-restore-data.sh) bu adımdan ÖNCE yapabilirsin: migration yalnızca
# eksik olanları uygular. Boş veritabanında tüm şemayı kurar.

source "$(dirname "$0")/lib.sh"
require_root

require_env_filled "$APP_DIR/backend/.env"
[[ -d "$APP_DIR/.git" ]] || die "$APP_DIR klonlanmamış. Önce 20-app.sh."

build_backend
build_admin
build_web
pm2_start_all

step "Açılışta otomatik başlatma (systemd)"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$PURE_USER" --hp "/home/$PURE_USER" >/dev/null
systemctl enable "pm2-${PURE_USER}" >/dev/null
as_pure pm2 save

health_check
as_pure pm2 status
log "Tamam. Sıradaki: sudo bash 80-verify.sh"
