-- AlterTable
ALTER TABLE "sub_plans" ADD COLUMN "availableDurations" JSONB,
ADD COLUMN "availablePeriods" JSONB,
ADD COLUMN "availableGrinds" JSONB;
