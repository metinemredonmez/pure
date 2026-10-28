#!/usr/bin/env bash
# 10 — PostgreSQL ve Redis: yalnızca bu makineden erişilebilir, uygulamaya özel kullanıcıyla.
# Veritabanı şifresi bu sunucuda üretilir ve /etc/pure/db.password dosyasında (yalnız root) durur.

source "$(dirname "$0")/lib.sh"
require_root

step "PostgreSQL"
install -d -m 700 "$SECRETS_DIR"
pw_file="$SECRETS_DIR/db.password"
if [[ ! -s "$pw_file" ]]; then
  (umask 077 && gen_secret 24 >"$pw_file")
fi
DB_PASS="$(<"$pw_file")"

systemctl enable --now postgresql

psql_admin() { sudo -u postgres psql -v ON_ERROR_STOP=1 "$@"; }

# Şifre (yalnızca hex karakter, tırnak güvenli) stdin ile gider: `ps` ve sudo günlüğünde görünmez.
if psql_admin -tA <<<"SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}'" | grep -q 1; then
  psql_admin <<<"ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';"
else
  psql_admin <<<"CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';"
fi

if ! psql_admin -tA <<<"SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1; then
  psql_admin <<<"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER} ENCODING 'UTF8';"
fi
psql_admin <<<"REVOKE ALL ON DATABASE ${DB_NAME} FROM PUBLIC; GRANT ALL ON DATABASE ${DB_NAME} TO ${DB_USER};"

# RAM'e göre ayar (8 GB sunucuda: shared_buffers 1 GB, effective_cache_size 4 GB)
mem_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
pg_ver="$(pg_lsclusters -h | awk 'NR==1 {print $1}')"
conf="/etc/postgresql/${pg_ver}/main/conf.d/90-pure.conf"
cat >"$conf" <<EOF
# 10-database.sh tarafından üretildi
listen_addresses = 'localhost'
password_encryption = scram-sha-256
shared_buffers = $((mem_mb / 8))MB
effective_cache_size = $((mem_mb / 2))MB
work_mem = 16MB
maintenance_work_mem = 256MB
max_connections = 60
log_min_duration_statement = 1000
EOF
systemctl restart postgresql

# Dışarıya açık olmadığını doğrula
if ss -ltn | awk '$4 ~ /:5432$/ {print $4}' | grep -v -E '^(127\.0\.0\.1|\[::1\]):5432$' | grep -q .; then
  die "PostgreSQL localhost dışında bir adreste dinliyor! ss -ltnp | grep 5432"
fi
PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT 1' >/dev/null
log "PostgreSQL hazır: veritabanı ${DB_NAME}, kullanıcı ${DB_USER}, yalnızca localhost."

step "Redis"
redis_conf=/etc/redis/redis.conf
set_redis() { # anahtar değer — varsa değiştir, yoksa ekle
  if grep -q -E "^${1}[[:space:]]" "$redis_conf"; then
    sed -i -E "s|^${1}[[:space:]].*|${1} ${2}|" "$redis_conf"
  else
    echo "${1} ${2}" >>"$redis_conf"
  fi
}
# Uygulama Redis şifresi desteklemiyor (yalnızca host/port); bu yüzden erişim sadece localhost.
set_redis bind "127.0.0.1 -::1"
set_redis protected-mode yes
set_redis port 6379
set_redis maxmemory 256mb
set_redis maxmemory-policy noeviction   # BullMQ kuyruk verisi silinmesin
systemctl enable --now redis-server
systemctl restart redis-server
[[ "$(redis-cli -h 127.0.0.1 ping)" == "PONG" ]] || die "Redis cevap vermiyor."
if ss -ltn | awk '$4 ~ /:6379$/ {print $4}' | grep -v -E '^(127\.0\.0\.1|\[::1\]):6379$' | grep -q .; then
  die "Redis localhost dışında dinliyor!"
fi
log "Redis hazır (yalnızca localhost)."
