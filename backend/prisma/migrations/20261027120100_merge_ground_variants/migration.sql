-- Aktif varyantlardaki eski öğütme tipleri (Filtre, Espresso, V60, French Press, Türk Kahvesi)
-- her (ürün, kavurma, gramaj) için TEK "Öğütülmüş" (GROUND) varyantında birleştirilir.
-- Fazlası SİLİNMEZ, pasifleştirilir: sipariş geçmişi variantName snapshot'ıyla okunmaya devam eder.

-- 1) Aynı (ürün, kavurma, gramaj) içinde bir tanesi kalır (Filtre öncelikli, sonra en eski)
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "productId", "roastLevel", "weight"
      ORDER BY ("grindType" = 'FILTER') DESC, "createdAt", "id"
    ) AS rn
  FROM "product_variants"
  WHERE "isActive" = true
    AND "grindType" IN ('FRENCH_PRESS', 'V60', 'FILTER', 'ESPRESSO', 'TURKISH')
)
UPDATE "product_variants" AS v
SET "isActive" = false, "updatedAt" = NOW()
FROM ranked
WHERE v."id" = ranked."id" AND ranked.rn > 1;

-- 2) Kalan varyant "Öğütülmüş" olur; otomatik üretilmiş addaki öğütme etiketi de güncellenir
UPDATE "product_variants"
SET
  "grindType" = 'GROUND',
  "name" = regexp_replace("name", '(Filtre|Espresso|French Press|V60|Türk Kahvesi)', 'Öğütülmüş'),
  "updatedAt" = NOW()
WHERE "isActive" = true
  AND "grindType" IN ('FRENCH_PRESS', 'V60', 'FILTER', 'ESPRESSO', 'TURKISH');
