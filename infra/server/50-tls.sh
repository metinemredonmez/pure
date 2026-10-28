#!/usr/bin/env bash
# 50 — Let's Encrypt sertifikası (tek sertifika: site, www, admin, api).
#
#   Geçiş ÖNCESİ, DNS henüz eski sunucudayken (kesintisiz geçiş için önerilen):
#     sudo LE_EMAIL=sen@ornek.com bash 50-tls.sh dns
#       → ekranda çıkan TXT kayıtlarını DNS panelinden ekle, Enter'a bas.
#   Geçiş SONRASI (DNS bu sunucuya döndü): yenilemeyi otomatik hâle getir
#     sudo LE_EMAIL=sen@ornek.com bash 50-tls.sh webroot
#
# Elle (dns) alınan sertifika kendiliğinden yenilenemez; `webroot` adımı bunu çözer.

source "$(dirname "$0")/lib.sh"
require_root

mode="${1:-}"
[[ "$mode" == "dns" || "$mode" == "webroot" ]] || die "Kullanım: 50-tls.sh dns|webroot"
: "${LE_EMAIL:?LE_EMAIL gerekli (sertifika bildirimleri için e-posta)}"

names=(-d "$DOMAIN" -d "www.${DOMAIN}" -d "$ADMIN_DOMAIN" -d "$API_DOMAIN")
install -d -m 0755 /var/www/certbot

# Her yenilemeden sonra nginx sertifikayı yeniden yüklesin
install -d -m 0755 /etc/letsencrypt/renewal-hooks/deploy
cat >/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/sh
systemctl reload nginx
EOF
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

case "$mode" in
  dns)
    certbot certonly --manual --preferred-challenges dns \
      --cert-name "$DOMAIN" "${names[@]}" \
      --agree-tos --no-eff-email -m "$LE_EMAIL"
    log "Sertifika alındı. Sıradaki: sudo bash 40-nginx.sh tls"
    log "Geçişten SONRA: sudo LE_EMAIL=$LE_EMAIL bash 50-tls.sh webroot  (otomatik yenileme için)"
    ;;
  webroot)
    # 80 numaralı portta ACME yanıtı veren yapılandırma çalışıyor olmalı (40-nginx.sh acme ya da tls).
    # Elle (dns) alınmış sertifika varsa aynı ad ve alan adlarıyla yeniden alınır: certbot yenileme
    # yapılandırmasını (kimlik doğrulayıcı + http-01) günceller. "reconfigure" kullanılmaz çünkü
    # eski dns-01 tercihi kalıp webroot'u reddedebiliyor.
    certbot certonly --webroot -w /var/www/certbot \
      --cert-name "$DOMAIN" "${names[@]}" \
      --preferred-challenges http-01 --force-renewal \
      --agree-tos --no-eff-email -m "$LE_EMAIL"
    certbot renew --dry-run
    systemctl enable --now certbot.timer
    log "Otomatik yenileme hazır (certbot.timer). Sıradaki: sudo bash 40-nginx.sh tls"
    ;;
esac
