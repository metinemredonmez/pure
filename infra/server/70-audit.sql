-- 70 — Geri yüklenen veritabanında kurcalama izi arar. YALNIZCA OKUR, hiçbir şeyi değiştirmez.
--
--   sudo bash run-sql.sh 70-audit.sql | less -S
--
-- Eski sunucudan gelen veri güvenilmez sayılır; kurcalama izi aranır.
-- Aşağıdaki tarih eşiği 1 Temmuz 2026'dır; çıktıdaki her satırı gözle kontrol et.
-- Bir sorgu hata verirse (şema farkı) diğerleri çalışmaya devam eder.

\pset pager off
\pset null '(boş)'

\echo
\echo '=== 1) CUSTOMER dışındaki hesaplar (yönetici/personel/ortak) — hepsini tanıyor musun? ==='
SELECT id, email, role, "isActive", "mfaEnabled", "createdAt", "updatedAt"
FROM users WHERE role <> 'CUSTOMER' ORDER BY "createdAt";

\echo
\echo '=== 2) 1 Temmuz 2026''dan sonra oluşturulan/değiştirilen yönetici hesapları ==='
SELECT id, email, role, "isActive", "createdAt", "updatedAt"
FROM users
WHERE role <> 'CUSTOMER' AND ("createdAt" >= '2026-07-01' OR "updatedAt" >= '2026-07-01')
ORDER BY "updatedAt" DESC;

\echo
\echo '=== 3) Yönetici hesaplarının işlem yaptığı IP adresleri (yabancı/tanımadığın IP var mı?) ==='
SELECT a."ipAddress", count(*) AS islem, min(a."createdAt") AS ilk, max(a."createdAt") AS son
FROM audit_logs a JOIN users u ON u.id = a."userId"
WHERE u.role <> 'CUSTOMER' AND a."createdAt" >= '2026-07-01'
GROUP BY a."ipAddress" ORDER BY max(a."createdAt") DESC LIMIT 40;

\echo
\echo '=== 4) Hassas varlıklara dokunan son denetim kayıtları ==='
SELECT "createdAt", "userId", action, entity, "entityId", "ipAddress"
FROM audit_logs
WHERE "createdAt" >= '2026-07-01'
  AND (entity ILIKE ANY (ARRAY['%user%','%integration%','%setting%','%role%','%coupon%','%apikey%','%api_key%','%payment%'])
       OR action ILIKE ANY (ARRAY['%role%','%password%','%delete%','%export%']))
ORDER BY "createdAt" DESC LIMIT 80;

\echo
\echo '=== 5) Entegrasyon ayarları (gizli değerler gösterilmez; gizli olmayanlar açık) ==='
SELECT key, "group", "isEncrypted",
       ("encryptedValue" IS NOT NULL OR "plainValue" IS NOT NULL) AS dolu,
       CASE WHEN "isEncrypted" THEN '(gizli)' ELSE "plainValue" END AS deger,
       "updatedAt"
FROM integration_settings ORDER BY "updatedAt" DESC;

\echo
\echo '=== 6) API anahtarları ==='
SELECT id, name, prefix, "isActive", "lastUsedAt", "expiresAt", "createdAt"
FROM api_keys ORDER BY "createdAt" DESC;

\echo
\echo '=== 7) 1 Temmuz 2026''dan sonra oluşturulan kuponlar (beklenmedik %100 indirim var mı?) ==='
SELECT code, type, value, "maxUses", "usedCount", "isActive", "createdAt"
FROM coupons WHERE "createdAt" >= '2026-07-01' ORDER BY "createdAt" DESC LIMIT 50;

\echo
\echo '=== 8) Site ayarları: anahtar ve boyut ==='
SELECT key, length(value::text) AS boyut FROM site_settings ORDER BY key;

\echo
\echo '=== 9) Tüm metin sütunlarında betik/enjeksiyon örüntüsü taraması ==='
\echo '(Eski yorumlar XSS düzeltmesinden önce kaydedildiyse "reviews" satırı çıkabilir; içeriğine bak.)'
CREATE TEMP TABLE audit_hits (tbl text, col text, hits bigint);
DO $$
DECLARE
  r record;
  n bigint;
BEGIN
  FOR r IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')
      AND table_name <> '_prisma_migrations'
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM public.%I WHERE %I::text ~* %L',
      r.table_name, r.column_name,
      '<script|javascript:|onerror[[:space:]]*=|onload[[:space:]]*=|<iframe'
    ) INTO n;
    IF n > 0 THEN
      INSERT INTO audit_hits VALUES (r.table_name, r.column_name, n);
    END IF;
  END LOOP;
END $$;
SELECT * FROM audit_hits ORDER BY hits DESC;

\echo
\echo '=== 11) Beklenmeyen veritabanı nesneleri: Prisma şemasında fonksiyon/tetikleyici/görünüm YOKTUR, çıkarsa şüpheli ==='
SELECT 'fonksiyon' AS tur, p.proname::text AS ad
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'
UNION ALL
SELECT 'tetikleyici', t.tgname::text
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname = 'public'
UNION ALL
SELECT 'görünüm', viewname::text FROM pg_views WHERE schemaname = 'public'
UNION ALL
SELECT 'uzantı', extname::text FROM pg_extension WHERE extname <> 'plpgsql';

\echo
\echo '=== 12) Şifreli veri envanteri (reencrypt-secrets.js bunları işler) ==='
SELECT 'users.mfaSecret' AS alan, count(*) AS adet FROM users WHERE "mfaSecret" IS NOT NULL
UNION ALL SELECT 'subscriptions.paymentToken', count(*) FROM subscriptions WHERE "paymentToken" IS NOT NULL
UNION ALL SELECT 'integration_settings.encryptedValue', count(*) FROM integration_settings WHERE "encryptedValue" IS NOT NULL;
