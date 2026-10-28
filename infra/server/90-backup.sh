#!/usr/bin/env bash
# 90 — Günlük veritabanı yedeği (14 gün saklanır) ve yüklenen görsellerin aynası.
#
#   sudo bash 90-backup.sh
#
# Yedekler AYNI diskte durur (yalnız root okur): yanlışlıkla silme, bozuk deploy ve veri hatalarına karşı
# korur, sunucunun kaybına karşı KORUMAZ. backend.env kopyası şifreleme anahtarlarını da içerir; bu
# yüzden yedek dizini dışarı kopyalarken gizli bilgi taşıdığını unutma. Bunun için sağlayıcının otomatik yedek/anlık görüntü (snapshot)
# hizmetini aç ve ara sıra yedeği Mac'ine indir (bkz. MIGRASYON-PLANI.md).

source "$(dirname "$0")/lib.sh"
require_root

: "${BACKUP_DIR:=/var/backups/pure}"
: "${KEEP_DAYS:=14}"
install -d -m 700 "$BACKUP_DIR"

cat >/usr/local/sbin/pure-backup <<SCRIPT
#!/usr/bin/env bash
set -Eeuo pipefail
day="\$(date +%F)"

# Veritabanı
out="$BACKUP_DIR/db-\$(date +%F-%H%M).dump"
runuser -u postgres -- pg_dump -Fc "$DB_NAME" >"\$out"
pg_restore -l "\$out" >/dev/null   # dosya okunabiliyor mu
chmod 600 "\$out"

# Görseller: tarihli anlık görüntü; değişmeyen dosyalar önceki günle sabit bağlanır (az yer tutar).
# Düz ayna (--delete) kullanılmaz: silinen/bozulan dosya bir sonraki yedekte yok olurdu.
prev="\$(find "$BACKUP_DIR" -maxdepth 1 -type d -name 'uploads-*' ! -name "uploads-\$day" | sort | tail -1)"
rsync -a --no-links \${prev:+--link-dest="\$prev"} "$APP_DIR/backend/uploads/" "$BACKUP_DIR/uploads-\$day/"

# Şifreleme anahtarları yalnızca .env'de durur; bunlar olmadan yedekteki şifreli alanlar çözülemez.
install -m 600 "$APP_DIR/backend/.env" "$BACKUP_DIR/backend.env"

find "$BACKUP_DIR" -maxdepth 1 -name 'db-*.dump' -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -maxdepth 1 -type d -name 'uploads-*' -mtime +$KEEP_DAYS -exec rm -rf {} +
logger -t pure-backup "tamam: \$out (\$(du -h "\$out" | cut -f1))"
SCRIPT
chmod 755 /usr/local/sbin/pure-backup

cat >/etc/systemd/system/pure-backup.service <<'UNIT'
[Unit]
Description=Pure Olentia yedekleme

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/pure-backup
UNIT

cat >/etc/systemd/system/pure-backup.timer <<'UNIT'
[Unit]
Description=Pure Olentia günlük yedek

[Timer]
OnCalendar=*-*-* 03:30:00
RandomizedDelaySec=10min
Persistent=true

[Install]
WantedBy=timers.target
UNIT

systemctl daemon-reload
systemctl enable --now pure-backup.timer

log "İlk yedek alınıyor…"
systemctl start pure-backup.service
find "$BACKUP_DIR" -maxdepth 1 -name 'db-*.dump' -exec du -h {} +
log "Zamanlayıcı: $(systemctl list-timers pure-backup.timer --no-legend | awk '{print $1, $2}')  (kontrol: systemctl list-timers)"
