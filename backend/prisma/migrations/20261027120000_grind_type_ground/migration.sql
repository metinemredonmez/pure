-- Öğütme seçimi iki seçeneğe indirildi: Çekirdek (WHOLE_BEAN) / Öğütülmüş (GROUND).
-- Yeni enum değeri aynı transaction'da kullanılamadığı için veri dönüşümü ayrı migration'da.

-- AlterEnum
ALTER TYPE "GrindType" ADD VALUE IF NOT EXISTS 'GROUND';
