#!/usr/bin/env bash
# SQL dosyasını UYGULAMA kullanıcısıyla (süper kullanıcı değil) çalıştırır.
#
#   sudo bash run-sql.sh 70-audit.sql | less -S
#   sudo bash run-sql.sh 71-cleanup.sql

source "$(dirname "$0")/lib.sh"
require_root

file="${1:?Kullanım: sudo bash run-sql.sh <dosya.sql>}"
[[ -r "$file" ]] || die "$file okunamıyor."
[[ -s "$SECRETS_DIR/db.password" ]] || die "Önce 10-database.sh çalıştır."

pgpass="$(db_pgpass_file)"
trap 'rm -f "$pgpass"' EXIT
PGPASSFILE="$pgpass" psql -X -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" <"$file"
