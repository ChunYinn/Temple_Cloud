-- AlterTable - Remove receipt_enabled column from temple_donation_settings
ALTER TABLE "temple_donation_settings" DROP COLUMN IF EXISTS "receipt_enabled";