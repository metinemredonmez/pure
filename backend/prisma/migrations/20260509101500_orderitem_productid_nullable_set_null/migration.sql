-- AlterTable: orderItem.productId nullable
ALTER TABLE "order_items" ALTER COLUMN "productId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_productId_fkey";

-- AddForeignKey: ON DELETE SET NULL — ürün silindiğinde orderItem productId NULL olur,
-- productName/variantName snapshot'ı sayesinde geçmiş okunmaya devam eder.
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
