-- CreateEnum
CREATE TYPE "PrayerServiceCode" AS ENUM ('TAISUI', 'GUANGMING', 'WENCHANG', 'BAIDOU', 'YUELAO');

-- CreateTable
CREATE TABLE "temple_prayer_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temple_id" UUID NOT NULL,
    "service_code" "PrayerServiceCode" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "custom_price" INTEGER,
    "max_quantity" INTEGER,
    "annual_limit" INTEGER,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "temple_prayer_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temple_donation_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temple_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "min_amount" INTEGER NOT NULL DEFAULT 100,
    "suggested_amounts" INTEGER[] DEFAULT ARRAY[100, 300, 500, 1000, 3000, 5000]::INTEGER[],
    "allow_custom_amount" BOOLEAN NOT NULL DEFAULT true,
    "allow_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "show_donor_list" BOOLEAN NOT NULL DEFAULT false,
    "custom_message" TEXT,
    "receipt_template" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "temple_donation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_service_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temple_id" UUID NOT NULL,
    "service_code" "PrayerServiceCode" NOT NULL,
    "order_number" TEXT NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_mobile" TEXT NOT NULL,
    "applicant_email" TEXT,
    "entries" JSONB NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "shipping_info" JSONB,
    "donation_amount" INTEGER,
    "donation_info" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT,
    "payment_method" TEXT,
    "paid_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prayer_service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temple_prayer_services_temple_id_service_code_key" ON "temple_prayer_services"("temple_id", "service_code");

-- CreateIndex
CREATE UNIQUE INDEX "temple_donation_settings_temple_id_key" ON "temple_donation_settings"("temple_id");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_service_orders_order_number_key" ON "prayer_service_orders"("order_number");

-- CreateIndex
CREATE INDEX "prayer_service_orders_temple_id_idx" ON "prayer_service_orders"("temple_id");

-- CreateIndex
CREATE INDEX "prayer_service_orders_status_idx" ON "prayer_service_orders"("status");

-- AddForeignKey
ALTER TABLE "temple_prayer_services" ADD CONSTRAINT "temple_prayer_services_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temple_donation_settings" ADD CONSTRAINT "temple_donation_settings_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_service_orders" ADD CONSTRAINT "prayer_service_orders_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE CASCADE ON UPDATE CASCADE;