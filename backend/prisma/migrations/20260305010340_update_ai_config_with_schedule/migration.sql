-- AlterTable
ALTER TABLE "AIConfig" ADD COLUMN     "cronSchedule" TEXT NOT NULL DEFAULT '0 9 * * *',
ADD COLUMN     "lastTriggeredAt" TIMESTAMP(3);
