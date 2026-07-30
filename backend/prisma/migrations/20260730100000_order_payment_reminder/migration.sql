-- Ödenmemiş (PENDING) sipariş hatırlatma maili takibi (gün-aşırı)
ALTER TABLE "orders" ADD COLUMN "reminderCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "lastReminderAt" TIMESTAMP(3);
