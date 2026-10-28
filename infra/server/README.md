# Sunucu kurulum script'leri

Temiz bir **Ubuntu 24.04** sunucuyu sıfırdan, sertleştirilmiş şekilde kurar. Sıra önemlidir; her script
tekrar çalıştırılabilir (idempotent) olacak şekilde yazıldı.

| # | Script | Kim çalıştırır | Ne yapar |
|---|--------|----------------|----------|
| 00 | `00-bootstrap.sh` | root (ilk giriş, bir kez) | Paketler, Node 22, pm2, SSH sertleştirme (yalnız anahtar), ufw, fail2ban, otomatik güvenlik güncellemesi, swap, auditd, ClamAV |
| 10 | `10-database.sh` | sudo | PostgreSQL + Redis, yalnız localhost, uygulamaya özel kullanıcı |
| 20 | `20-app.sh` | sudo | Kodu klonlar, **yeni** sırlarla `.env` dosyalarını üretir |
| 30 | `30-build-start.sh` | sudo | Migration + derleme + pm2 + açılışta otomatik başlatma |
| 40 | `40-nginx.sh acme\|tls` | sudo | nginx (HTTP/2, hız sınırı, `/uploads` doğrudan diskten) |
| 50 | `50-tls.sh dns\|webroot` | sudo | Let's Encrypt sertifikası ve otomatik yenileme |
| 60 | `60-restore-data.sh` | sudo | Veritabanı yedeği + yüklenen görseller (taramalı, karantinalı) |
| — | `run-sql.sh` | sudo | SQL dosyasını uygulama kullanıcısıyla (süper kullanıcı değil) çalıştırır |
| 70 | `70-audit.sql` | run-sql.sh | Kurcalama izi arar (salt okunur) |
| 71 | `71-cleanup.sql` | run-sql.sh | Oturum / sıfırlama belirteçlerini siler |
| — | `reencrypt-secrets.js` | node | Şifreli alanları yeni anahtara çevirir / sıfırlar |
| 80 | `80-verify.sh` | sudo | Kurulumu doğrular (güvenlik + işlev) |
| 90 | `90-backup.sh` | sudo | Günlük DB yedeği (14 gün) + görsel aynası, systemd zamanlayıcısı |
| — | `deploy.sh` | sudo | Sonraki güncellemeler: çek → derle → yeniden başlat |

Adım adım anlatım (komutlar, geçiş planı, hesap rotasyonları) repo dışında tutulan `MIGRASYON-PLANI.md` dosyasındadır.

## Tasarım kararları

- **Uygulamalar root değil, `pure` kullanıcısıyla çalışır** (girişi ve sudo'su yok). Bir uygulama açığı doğrudan sunucuyu vermez.
- **SSH yalnızca anahtarla**, root girişi kapalı, fail2ban açık. Uygulama portları (3000/3001/4000) dışarıya kapalı; site ve admin ayrıca `127.0.0.1`'e bağlanır.
- **Sırlar sunucuda üretilir**, eski bir `.env` kopyalanmaz. `ENCRYPTION_KEY` değiştiği için eski şifreli veriler `reencrypt-secrets.js` ile işlenir.
- **nginx HTML sayfalarına `Cache-Control` eklemez.** Önbellek başlıklarını Next.js verir (`location /products` + `immutable` hatasının tekrarı önlenir). `80-verify.sh` bunu kontrol eder.
- **`X-Forwarded-For` üzerine yazılır**, eklenmez: backend ilk değeri istemci IP'si sayıyor, istemcinin sahte başlığıyla hız sınırı atlatılamaz.
- **auditd** `/etc/systemd/system`, `/usr/local/bin`, SSH anahtarları, cron ve sudoers değişikliklerini kaydeder: `sudo ausearch -k systemd_units -i`.
- **Root script'leri `/opt/pure-infra` altında, root'a ait**: kod dizini `pure`a ait olduğu için deploy oradan çalışmaz; bir uygulama açığı bir sonraki `sudo deploy.sh` ile root'a dönüşemez. Deploy: `sudo bash /opt/pure-infra/deploy.sh`.
- **Dışarıdan gelen veri güvenilmez**: yedek süper kullanıcıyla değil uygulama kullanıcısıyla geri yüklenir (`COPY ... TO PROGRAM` işe yaramaz), görsel arşivi root yerine `pure` ile açılır, sembolik bağ/cihaz dosyası içeren arşiv reddedilir.
- **`deploy.sh`** sunucudaki kodda GitHub'dan farklı bir değişiklik (lock dosyaları hariç) görürse durur; bu kurcalama belirtisidir.

## Sınır

Bu script'ler macOS'ta yazıldı; `bash -n` ve `shellcheck` ile denetlendi, nginx şablonları gerçek bir nginx ile ve
sahte upstream'lerle test edildi, SQL ve `reencrypt-secrets.js` gerçek şemayla denendi. Ubuntu'ya özgü adımlar
(apt, ufw, systemd, certbot) bu ortamda **çalıştırılamadı**: ilk çalıştırmada çıktıyı izle, hata olursa durur.
