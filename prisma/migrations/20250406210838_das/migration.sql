-- AlterEnum
ALTER TYPE "BusinessType" ADD VALUE 'RETAIL';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "aiText" TEXT,
ADD COLUMN     "analytics" TEXT,
ADD COLUMN     "businessTerm" TEXT,
ADD COLUMN     "calendar" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "delivery" TEXT,
ADD COLUMN     "descriptionAI" TEXT,
ADD COLUMN     "holidays" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "socials" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "workTime" TEXT;
