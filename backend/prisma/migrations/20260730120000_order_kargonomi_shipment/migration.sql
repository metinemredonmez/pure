-- Kargonomi gönderi id eşleştirmesi (webhook shipment.updated -> sipariş)
ALTER TABLE "orders" ADD COLUMN "kargonomiShipmentId" INTEGER;
