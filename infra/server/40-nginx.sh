#!/usr/bin/env bash
# 40 — nginx yapılandırmasını kurar.
#
#   sudo bash 40-nginx.sh acme   # sertifika öncesi: yalnızca 80 + ACME doğrulaması
#   sudo bash 40-nginx.sh tls    # sertifika alındıktan sonra: tam yapılandırma (varsayılan)
#
# Hata olursa önceki yapılandırmaya döner; nginx'i bozuk bırakmaz.

source "$(dirname "$0")/lib.sh"
require_root

mode="${1:-tls}"
[[ "$mode" == "acme" || "$mode" == "tls" ]] || die "Kullanım: 40-nginx.sh [acme|tls]"

nginx_src="$SCRIPT_DIR/nginx"
site_conf=/etc/nginx/sites-available/pure.conf
site_link=/etc/nginx/sites-enabled/pure.conf

if [[ "$mode" == "tls" ]]; then
  [[ -s "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]] \
    || die "Sertifika yok (/etc/letsencrypt/live/${DOMAIN}). Önce: 40-nginx.sh acme && 50-tls.sh"
fi

step "Yapılandırma dosyaları ($mode)"
backup_dir="$(mktemp -d)"
for f in "$site_conf" /etc/nginx/conf.d/pure-http.conf /etc/nginx/snippets/pure-tls.conf /etc/nginx/snippets/pure-proxy.conf; do
  [[ -e "$f" ]] && cp -a "$f" "$backup_dir/$(basename "$f")"
done

install -d -m 0755 /etc/nginx/snippets /var/www/certbot
install -m 0644 "$nginx_src/pure-http.conf" /etc/nginx/conf.d/pure-http.conf
install -m 0644 "$nginx_src/pure-tls.conf" /etc/nginx/snippets/pure-tls.conf
install -m 0644 "$nginx_src/pure-proxy.conf" /etc/nginx/snippets/pure-proxy.conf

template="$nginx_src/site.conf.template"
[[ "$mode" == "acme" ]] && template="$nginx_src/acme.conf.template"
# Yalnızca bizim değişkenlerimizi değiştir; nginx'in $host gibi değişkenlerine dokunma.
export DOMAIN ADMIN_DOMAIN API_DOMAIN APP_DIR
# shellcheck disable=SC2016  # tek tırnak bilinçli: envsubst değişken adlarını kendisi okur
envsubst '${DOMAIN} ${ADMIN_DOMAIN} ${API_DOMAIN} ${APP_DIR}' <"$template" >"$site_conf"
chmod 644 "$site_conf"

rm -f /etc/nginx/sites-enabled/default
ln -sf "$site_conf" "$site_link"

# Yedekten geri yükle; yedek yoksa (ilk kurulum) dosyayı kaldır.
restore_or_remove() { # yedek adı, hedef yol
  if [[ -e "$backup_dir/$1" ]]; then
    cp -a "$backup_dir/$1" "$2"
  else
    rm -f "$2"
  fi
}

rollback() {
  warn "nginx testi başarısız; önceki yapılandırma geri yükleniyor."
  restore_or_remove pure.conf "$site_conf"
  [[ -e "$site_conf" ]] || rm -f "$site_link"
  restore_or_remove pure-http.conf /etc/nginx/conf.d/pure-http.conf
  restore_or_remove pure-tls.conf /etc/nginx/snippets/pure-tls.conf
  restore_or_remove pure-proxy.conf /etc/nginx/snippets/pure-proxy.conf
}

if ! nginx -t; then
  rollback
  die "nginx yapılandırması geçersiz (yukarıdaki hata). Değişiklik geri alındı."
fi

systemctl enable nginx
systemctl reload nginx || systemctl restart nginx
log "nginx hazır ($mode)."
if [[ "$mode" == "acme" ]]; then
  log "Sıradaki: DNS kayıtları bu sunucuyu gösteriyorsa  sudo LE_EMAIL=sen@ornek.com bash 50-tls.sh webroot"
fi
