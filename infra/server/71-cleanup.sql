-- 71 — Geri yükleme sonrası oturum ve sıfırlama belirteçlerini temizler.
--
--   sudo bash run-sql.sh 71-cleanup.sql
--
-- Neden: eski sunucuda yetkisiz birinin oturum açmış veya şifre sıfırlama isteği oluşturmuş olması
-- ihtimaline karşı herkes yeniden giriş yapar. Yeni JWT_SECRET zaten erişim belirteçlerini geçersiz kılar;
-- yenileme (refresh) belirteçleri veritabanında olduğu için burada silinir.
-- Etkisi: müşteriler ve yöneticiler bir kez yeniden giriş yapar; bekleyen e-posta doğrulama
-- bağlantıları geçersiz olur (kullanıcı yenisini ister).

BEGIN;
DELETE FROM refresh_tokens;
DELETE FROM password_reset_tokens;
DELETE FROM email_verification_tokens;

-- B2B API anahtarları: hash'lendiği için çalınmaları pek olası değil, ama güvenmek istersen aç
-- ve iş ortaklarına yenisini üret (admin panel → API anahtarları):
-- UPDATE api_keys SET "isActive" = false;
COMMIT;

SELECT 'refresh_tokens' AS tablo, count(*) FROM refresh_tokens
UNION ALL SELECT 'password_reset_tokens', count(*) FROM password_reset_tokens
UNION ALL SELECT 'email_verification_tokens', count(*) FROM email_verification_tokens;
