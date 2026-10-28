#!/usr/bin/env bash
# 80 — Kurulum sonrası doğrulama. Salt okunur; hiçbir şeyi değiştirmez.
# Başarısız kontrol varsa çıkış kodu 1 olur.
#
#   sudo bash 80-verify.sh

source "$(dirname "$0")/lib.sh"
require_root

pass=0
fail=0
warns=0
ok()   { printf '  %s✔%s %s\n' "$c_green" "$c_off" "$1"; pass=$((pass + 1)); }
bad()  { printf '  %s✘%s %s\n' "$c_red" "$c_off" "$1"; fail=$((fail + 1)); }
note() { printf '  %s!%s %s\n' "$c_yellow" "$c_off" "$1"; warns=$((warns + 1)); }
check() { # açıklama, komut...
  local desc="$1"
  shift
  if "$@" >/dev/null 2>&1; then ok "$desc"; else bad "$desc"; fi
}

step "Sistem"
for svc in ssh nginx postgresql redis-server fail2ban auditd; do
  check "$svc çalışıyor" systemctl is-active --quiet "$svc"
done
check "güvenlik duvarı (ufw) etkin" bash -c "ufw status | grep -q 'Status: active'"
check "SSH: şifreyle giriş kapalı" bash -c "sshd -T | grep -qi '^passwordauthentication no'"
check "SSH: root girişi kapalı" bash -c "sshd -T | grep -qi '^permitrootlogin no'"
check "otomatik güvenlik güncellemeleri açık" bash -c "grep -q 'Unattended-Upgrade \"1\"' /etc/apt/apt.conf.d/20auto-upgrades"
if systemctl is-enabled --quiet pure-backup.timer 2>/dev/null; then ok "günlük yedek zamanlayıcısı açık"; else note "Günlük yedek kurulu değil: sudo bash 90-backup.sh"; fi
check "swap tanımlı" bash -c "[[ -n \"\$(swapon --show --noheadings)\" ]]"
check "disk doluluğu %85'in altında" bash -c "[[ \$(df --output=pcent / | tail -1 | tr -dc 0-9) -lt 85 ]]"
# [d] / [n] köşeli parantez hilesi: pgrep -f, kendi `bash -c` üst sürecinin komut satırını yakalamasın.
check "uygulamalar root ile çalışmıyor" bash -c "! pgrep -u root -f '[d]ist/src/main.js|[n]ext start' >/dev/null"
check "güvenlik duvarında 3000/3001/4000/5432/6379 açık değil" bash -c "! ufw status | grep -E '(^| )(3000|3001|4000|5432|6379)(/| )' >/dev/null"

step "Dinleyen portlar"
# 80/443 ve sshd'nin yapılandırmasındaki portlar beklenen sayılır
ssh_ports=" $(sshd -T | awk '/^port / {print $2}' | tr '\n' ' ') "
while read -r addr; do
  port="${addr##*:}"
  if [[ "$port" == 80 || "$port" == 443 || "$ssh_ports" == *" $port "* ]]; then
    continue
  elif [[ "$port" == 4000 ]]; then
    note "API (4000) tüm arayüzlerde dinliyor ama ufw dışarıdan engelliyor — kabul edilebilir."
  else
    bad "Beklenmeyen dışa açık port: $addr  (ss -ltnp | grep :$port)"
  fi
done < <(ss -H -ltn | awk '{print $4}' | grep -v -E '^(127\.[0-9.]+(%lo)?|\[::1\]|\[::ffff:127\.[0-9.]+\]):' | sort -u)

step "Uygulamalar (pm2, kullanıcı: $PURE_USER)"
for app in pureolentia-api pureolentia-web pureolentia-admin; do
  st="$(as_pure pm2 jlist 2>/dev/null | jq -r --arg n "$app" '.[] | select(.name==$n) | .pm2_env.status' || true)"
  if [[ "$st" == "online" ]]; then ok "$app online"; else bad "$app durumu: ${st:-yok}"; fi
done
body="$(curl -s --max-time 10 http://127.0.0.1:4000/api/health || true)"
if [[ "$body" == *'"status":"ok"'* && "$body" != *'error'* ]]; then ok "API sağlık: veritabanı dahil ok"; else bad "API sağlık cevabı beklenmedik: ${body:0:120}"; fi
check "Redis cevap veriyor" bash -c "[[ \$(redis-cli -h 127.0.0.1 ping) == PONG ]]"
if systemctl is-active --quiet clamav-daemon; then
  # shellcheck disable=SC2016  # tek tırnak bilinçli: ifade alt kabukta çalışır
  check "ClamAV (3310) cevap veriyor" bash -c 'exec 3<>/dev/tcp/127.0.0.1/3310; printf "nPING\n" >&3; read -r -t 5 line <&3; [[ "$line" == PONG ]]'
fi

step "nginx üzerinden (bu makineden, --resolve ile)"
cert="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if [[ ! -s "$cert" ]]; then
  note "Sertifika yok; HTTPS kontrolleri atlandı."
else
  r() { curl -sk --max-time 15 --resolve "${DOMAIN}:443:127.0.0.1" --resolve "www.${DOMAIN}:443:127.0.0.1" \
    --resolve "${ADMIN_DOMAIN}:443:127.0.0.1" --resolve "${API_DOMAIN}:443:127.0.0.1" "$@"; }
  code() { r -o /dev/null -w '%{http_code}' "$@"; }

  expect() { # açıklama, beklenen, gelen
    if [[ "$3" == "$2" ]]; then ok "$1"; else bad "$1 (beklenen $2, gelen $3)"; fi
  }
  expect "site (/) 200" 200 "$(code "https://${DOMAIN}/")"
  expect "admin giriş sayfası 200" 200 "$(code "https://${ADMIN_DOMAIN}/admin/login")"
  expect "API (https) sağlık 200" 200 "$(code "https://${API_DOMAIN}/api/health")"
  expect "www → ana alan adı yönlendirmesi (301)" 301 "$(code "https://www.${DOMAIN}/")"
  expect "http → https yönlendirmesi (301)" 301 \
    "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 --resolve "${DOMAIN}:80:127.0.0.1" "http://${DOMAIN}/")"

  hdr="$(r -D - -o /dev/null "https://${DOMAIN}/")"
  if grep -qi '^strict-transport-security' <<<"$hdr"; then ok "HSTS başlığı var"; else bad "HSTS başlığı yok"; fi
  if grep -i '^cache-control' <<<"$hdr" | grep -qi 'immutable'; then
    bad "HTML sayfası 'immutable' önbellek başlığı alıyor (eski hata!)"
  else
    ok "HTML sayfası 'immutable' önbellek başlığı almıyor"
  fi
  expect "/.env erişilemez (404)" 404 "$(code "https://${DOMAIN}/.env")"
  expect "/.git erişilemez (404)" 404 "$(code "https://${DOMAIN}/.git/config")"
  if [[ "$(code "https://${API_DOMAIN}/api/docs")" == "404" ]]; then
    ok "Swagger kapalı"
  else
    note "Swagger (/api/docs) 404 vermedi; SWAGGER_ENABLED=false olmalı."
  fi

  pt="$(r -D - -X POST "https://${API_DOMAIN}/api/webhooks/paytr" -d 'merchant_oid=VERIFY&status=success&total_amount=1&hash=x' || true)"
  if grep -qi '^content-type: text/plain' <<<"$pt" && grep -q 'PAYTR notification failed' <<<"$pt"; then
    ok "PayTR bildirim ucu düz metin cevap veriyor"
  else
    bad "PayTR bildirim ucu beklenen düz metni vermedi"
  fi

  check "sertifika en az 14 gün geçerli" openssl x509 -checkend $((14 * 86400)) -noout -in "$cert"
  check "certbot yenileme zamanlayıcısı açık" systemctl is-enabled --quiet certbot.timer
fi

printf '\n%s%d başarılı, %d başarısız, %d uyarı%s\n' "$c_bold" "$pass" "$fail" "$warns" "$c_off"
((fail == 0)) || exit 1
