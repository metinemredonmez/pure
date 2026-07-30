-- Ödeme alındı ama admin onayı bekliyor durumu (BEKLEME).
-- PENDING = ödeme bekleniyor (ödenmemiş), PAID = ödendi/onay bekliyor.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAID' AFTER 'PENDING';
