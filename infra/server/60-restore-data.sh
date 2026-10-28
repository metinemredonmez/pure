#!/usr/bin/env bash
# 60 — Eski sunucudan alınan veritabanı yedeğini ve yüklenen görselleri geri yükler.
#
#   sudo DUMP_FILE=$HOME/gelen/pure-db.dump \
#        UPLOADS_TAR=$HOME/gelen/uploads.tar.gz \
#        bash 60-restore-data.sh
#
# Eski sunucu güvenilmez sayıldığı için GELEN VERİ DE GÜVENİLMEZ kabul edilir:
#  - Yedek, süper kullanıcıyla değil UYGULAMA kullanıcısıyla geri yüklenir; yedeğin içine gömülmüş
#    SQL (COPY ... TO PROGRAM, RESET ROLE vb.) sunucuda komut çalıştıramaz.
#  - Görsel arşivi root ile değil `pure` kullanıcısıyla açılır; sembolik bağ / cihaz dosyası içeren
#    arşiv reddedilir. Görseller taranır, şüpheli dosyalar karantinaya alınır.
#  - Geri yüklemeden sonra 70-audit.sql ile kurcalama izi aranır.
#
# Yedeklerin nasıl alınacağı için MIGRASYON-PLANI.md'ye bak.

source "$(dirname "$0")/lib.sh"
require_root

: "${DUMP_FILE:?DUMP_FILE gerekli (pg_dump -Fc ile alınmış .dump dosyası)}"
: "${UPLOADS_TAR:=}"
QUARANTINE="${QUARANTINE:-/root/quarantine-uploads}"

[[ -s "$DUMP_FILE" ]] || die "$DUMP_FILE yok veya boş."
[[ -s "$SECRETS_DIR/db.password" ]] || die "Önce 10-database.sh çalıştır."

step "Yedek dosyası"
toc="$(mktemp)"
pgpass="$(db_pgpass_file)"
trap 'rm -f "$toc" "$pgpass"' EXIT
pg_restore -l "$DUMP_FILE" >"$toc" 2>/dev/null || die "Bu dosya pg_dump -Fc (custom) biçiminde görünmüyor."
sed -n 1,14p "$toc"
log "İçerik: $(grep -c 'TABLE DATA' "$toc" || true) tablo verisi."
# `public` şemasını biz oluşturuyoruz (yeni veritabanında zaten var); yedeğin kendi CREATE/COMMENT satırını at.
grep -v -E ' SCHEMA - public | COMMENT - SCHEMA public ' "$toc" >"$toc.filtered" || true
mv "$toc.filtered" "$toc"

warn "'$DB_NAME' veritabanı SİLİNİP bu yedekle yeniden oluşturulacak (mevcut içerik kaybolur)."
confirm "Devam edilsin mi?" || die "İptal edildi."

as_pure pm2 stop pureolentia-api >/dev/null 2>&1 || true

step "Veritabanını sıfırla ve geri yükle"
psql_admin() { sudo -u postgres psql -v ON_ERROR_STOP=1 "$@"; }
# Bu üç komut bizim (güvenilir) komutlarımız; yedeğin içeriği değil.
psql_admin -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE)"
psql_admin -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER} ENCODING 'UTF8'"
psql_admin -c "REVOKE ALL ON DATABASE ${DB_NAME} FROM PUBLIC" -c "GRANT ALL ON DATABASE ${DB_NAME} TO ${DB_USER}"

# Tek işlem + ilk hatada dur: yarım kalmış bir veritabanı bırakmaz. Süper kullanıcı değil, uygulama kullanıcısı.
PGPASSFILE="$pgpass" pg_restore -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-privileges --single-transaction --exit-on-error -L "$toc" "$DUMP_FILE"

PGPASSFILE="$pgpass" psql -X -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -tA -F ' ' <<'SQL' | awk '{printf "  %-22s %s\n", $1, $2}'
SELECT 'users', count(*) FROM users
UNION ALL SELECT 'products', count(*) FROM products
UNION ALL SELECT 'product_variants', count(*) FROM product_variants
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'subscriptions', count(*) FROM subscriptions;
SQL
log "Veritabanı geri yüklendi."

# Yedek eski bir şema düzeyindeyse (örn. yeni migration'lardan önce alındıysa) eksikleri uygula.
if [[ -x "$APP_DIR/backend/node_modules/.bin/prisma" ]]; then
  as_pure bash -c "cd '$APP_DIR/backend' && npx prisma migrate deploy"
else
  warn "Backend henüz kurulmamış (30-build-start.sh); migration o adımda uygulanır."
fi

if [[ -z "$UPLOADS_TAR" ]]; then
  warn "UPLOADS_TAR verilmedi; görsel geri yükleme atlandı."
else
  step "Görseller: güvenli içe aktarma"
  [[ -s "$UPLOADS_TAR" ]] || die "$UPLOADS_TAR yok veya boş."

  # Arşivde yalnızca normal dosya ve klasör olsun (sembolik bağ, sabit bağ, cihaz dosyası YOK)
  # ve mutlak yol / üst dizine kaçan yol olmasın.
  if tar -tzf "$UPLOADS_TAR" | grep -E '(^/|(^|/)\.\.(/|$))' >/dev/null; then
    die "Arşivde güvensiz yol var (mutlak yol veya '..'). İçe aktarılmadı."
  fi
  if tar -tvzf "$UPLOADS_TAR" | awk 'substr($1,1,1) != "-" && substr($1,1,1) != "d" {bad=1; print "  " $0} END {exit !bad}'; then
    die "Arşivde normal dosya/klasör dışında öğe var (yukarıdakiler). İçe aktarılmadı."
  fi

  # root ile açmak yerine `pure` ile açılır: arşivde ne olursa olsun yalnızca pure yetkisiyle yazabilir.
  work="$(as_pure mktemp -d /var/tmp/pure-uploads.XXXXXX)"
  as_pure tar -xzf - --no-same-owner --no-same-permissions -C "$work" <"$UPLOADS_TAR"
  src="$work/uploads"
  [[ -d "$src" ]] || die "Arşivin içinde 'uploads/' klasörü yok. Şöyle paketle: tar -czf uploads.tar.gz -C backend uploads"
  # Taramadan önce sahipliği root'a al: bundan sonra pure (ya da onu ele geçiren biri) dosyaları değiştiremez.
  chown -R root:root "$work"
  chmod -R a+rX "$work"

  install -d -m 700 "$QUARANTINE"
  flagged=0
  flag() { # dosya, neden
    flagged=$((flagged + 1))
    printf '  KARANTİNA: %s  (%s)\n' "${1#"$work"/}" "$2"
    mkdir -p "$QUARANTINE/$(dirname "${1#"$work"/}")"
    mv "$1" "$QUARANTINE/${1#"$work"/}"
  }

  # 1) gizli dosya, çalıştırma izni
  while IFS= read -r -d '' f; do flag "$f" "gizli dosya"; done < <(find "$src" -type f -name '.*' -print0)
  while IFS= read -r -d '' f; do flag "$f" "çalıştırma izni var"; done < <(find "$src" -type f -perm /111 -print0)

  # 2) uzantı + gerçek MIME türü uyuşmalı
  while IFS= read -r -d '' f; do
    ext="${f##*.}"
    ext="${ext,,}"
    mime="$(file --mime-type -b "$f")"
    case "$ext" in
      jpg | jpeg | png | webp | gif | avif)
        [[ "$mime" == image/* ]] || flag "$f" "uzantı görsel ama içerik: $mime"
        ;;
      svg)
        if grep -q -i -E '<script|onload=|onerror=|javascript:' "$f"; then flag "$f" "SVG içinde betik"; fi
        ;;
      pdf)
        [[ "$mime" == application/pdf ]] || flag "$f" "uzantı pdf ama içerik: $mime"
        ;;
      *)
        flag "$f" "beklenmeyen dosya türü (.$ext, $mime)"
        ;;
    esac
  done < <(find "$src" -type f -print0)

  # 3) ClamAV varsa tara (zararlı bulunanlar karantinaya taşınır). Çıkış kodu: 0 temiz, 1 virüs bulundu, 2+ hata.
  if command -v clamscan >/dev/null; then
    log "ClamAV taraması (birkaç dakika sürebilir)…"
    rc=0
    clamscan -r --infected --no-summary --move="$QUARANTINE" "$src" || rc=$?
    ((rc < 2)) || die "clamscan hata verdi (kod $rc); virüs veritabanı yok olabilir: sudo freshclam. Görseller taranmadığı için içe aktarılmadı."
  else
    warn "clamscan kurulu değil; virüs taraması yapılamadı."
  fi

  total="$(find "$src" -type f | wc -l)"
  log "İçe alınacak dosya: $total. Karantinaya alınan (tarama dışı): $flagged → $QUARANTINE"

  install -d -m 0755 -o "$PURE_USER" -g "$PURE_USER" "$APP_DIR/backend/uploads"
  # Hedefe pure yazar (root değil): hedefteki bir sembolik bağ root yetkisiyle izlenmez.
  as_pure rsync -rt --no-links --no-devices --no-specials --chmod=D755,F644 "$src/" "$APP_DIR/backend/uploads/"
  rm -rf "$work"
  log "Görseller $APP_DIR/backend/uploads altına aktarıldı."
fi

cat <<EOF

${c_bold}Sıradaki adımlar (sırayla):${c_off}
  1) Kurcalama izi ara (yalnızca okur):
       sudo bash ${SCRIPT_DIR}/run-sql.sh ${SCRIPT_DIR}/70-audit.sql | less -S
  2) Şifreli verileri yeni anahtara çevir. 30-build-start.sh ÇALIŞMIŞ olmalı (derlenmiş backend gerekir).
     Önce kuru çalıştırma; ayrıntı: MIGRASYON-PLANI.md → "Şifreli veriler".
  3) Eski oturum ve sıfırlama belirteçlerini sil:
       sudo bash ${SCRIPT_DIR}/run-sql.sh ${SCRIPT_DIR}/71-cleanup.sql
  4) API'yi başlat. DİKKAT: geri yüklenen veriyle ve GERÇEK ödeme/SMTP bilgileriyle başlarsa zamanlanmış
     işler müşterilere e-posta yollar ve abonelerin kartından çekim yapar. Provada bu bilgiler "prova"
     gibi sahte değerlerle doldurulmalı (MIGRASYON-PLANI.md 5.5 ve 5.8):
       sudo -u ${PURE_USER} pm2 restart pureolentia-api
EOF
