-- =============================================
-- SIMPLIFY AND ENHANCE SCHEMA MIGRATION
-- =============================================
-- This migration:
-- 1. Removes unnecessary complex tables (invites, page_blocks, temple_pages)
-- 2. Removes timezone field (Taiwan only, always Asia/Taipei)
-- 3. Enhances temples table with all needed fields
-- 4. Simplifies services table
-- 5. Adds events table for activities
-- 6. Adds gallery_images table
-- 7. Adds temple_stats for analytics
-- =============================================

-- Step 1: Drop unnecessary tables and constraints
-- =============================================
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS page_blocks CASCADE;
DROP TABLE IF EXISTS temple_pages CASCADE;
DROP TABLE IF EXISTS invites CASCADE;

-- Step 2: Drop unnecessary enums
-- =============================================
DROP TYPE IF EXISTS BlockType CASCADE;
DROP TYPE IF EXISTS PaymentProvider CASCADE;
DROP TYPE IF EXISTS PaymentStatus CASCADE;
DROP TYPE IF EXISTS ReceiptType CASCADE;
DROP TYPE IF EXISTS ReceiptStatus CASCADE;
DROP TYPE IF EXISTS OrderChannel CASCADE;
DROP TYPE IF EXISTS MemberStatus CASCADE;

-- Step 3: Simplify enums
-- =============================================
-- Keep only essential enums, simplify them
DROP TYPE IF EXISTS ServiceType CASCADE;
DROP TYPE IF EXISTS PricingType CASCADE;

-- Create simplified service type
CREATE TYPE service_unit AS ENUM ('year', 'month', 'time', 'piece');

-- Step 4: Add new columns to temples table
-- =============================================
ALTER TABLE temples
  -- Add new fields
  ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255),
  ADD COLUMN IF NOT EXISTS full_description TEXT,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS hours VARCHAR(255) DEFAULT '每日 06:00 - 21:00',
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10) DEFAULT '🏛️',
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS line_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  -- Drop timezone (always Asia/Taipei for Taiwan)
  DROP COLUMN IF EXISTS timezone;

-- Step 5: Recreate services table with simplified structure
-- =============================================
DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  icon VARCHAR(10) NOT NULL DEFAULT '🪔',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  unit service_unit NOT NULL DEFAULT 'year',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_temple_id ON services(temple_id);
CREATE INDEX idx_services_active ON services(is_active);

-- Step 6: Create events table
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE NOT NULL,
  event_time VARCHAR(10) NOT NULL, -- "09:00"
  location VARCHAR(255) NOT NULL,
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  registration_deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_temple_id ON events(temple_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_active ON events(is_active);

-- Step 7: Simplify orders table
-- =============================================
ALTER TABLE orders
  -- Add new fields
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'service',
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  -- Rename amount_cents to amount (we'll store as integer TWD)
  ADD COLUMN IF NOT EXISTS amount INTEGER,
  -- Drop unnecessary columns
  DROP COLUMN IF EXISTS service_type_snapshot,
  DROP COLUMN IF EXISTS customer_birthday,
  DROP COLUMN IF EXISTS wish,
  DROP COLUMN IF EXISTS channel,
  DROP COLUMN IF EXISTS currency;

-- Migrate amount_cents to amount
UPDATE orders SET amount = amount_cents WHERE amount IS NULL AND amount_cents IS NOT NULL;
ALTER TABLE orders DROP COLUMN IF EXISTS amount_cents;

-- Generate order numbers for existing orders
DO $$
DECLARE
  r RECORD;
  counter INTEGER := 1;
BEGIN
  FOR r IN SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at
  LOOP
    UPDATE orders SET order_number = 'ORD' || LPAD(counter::TEXT, 6, '0') WHERE id = r.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make order_number NOT NULL after backfilling
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;

-- Step 8: Create gallery_images table
-- =============================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_temple_id ON gallery_images(temple_id);
CREATE INDEX idx_gallery_featured ON gallery_images(is_featured);

-- Step 9: Create temple_stats table for analytics
-- =============================================
CREATE TABLE IF NOT EXISTS temple_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  donations_amount INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(temple_id, date)
);

CREATE INDEX idx_stats_temple_id ON temple_stats(temple_id);
CREATE INDEX idx_stats_date ON temple_stats(date);

-- Step 10: Simplify temple_members (remove status)
-- =============================================
ALTER TABLE temple_members DROP COLUMN IF EXISTS status;

-- Step 11: Drop old OrderStatus enum and create simplified one
-- =============================================
ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20);
DROP TYPE IF EXISTS OrderStatus CASCADE;
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status;

-- Step 12: Create trigger for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_temples_updated_at BEFORE UPDATE ON temples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 13: Add sample data for development (optional)
-- =============================================
-- This will only run if temples table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM services LIMIT 1) THEN
        -- Add default services for existing temples
        INSERT INTO services (temple_id, icon, name, description, price, unit, is_popular)
        SELECT
            id as temple_id,
            '🪔' as icon,
            '光明燈' as name,
            '點燈祈福，光明吉祥，照亮前程' as description,
            500 as price,
            'year'::service_unit as unit,
            true as is_popular
        FROM temples;

        INSERT INTO services (temple_id, icon, name, description, price, unit)
        SELECT
            id as temple_id,
            '🐲' as icon,
            '太歲燈' as name,
            '安太歲，消災解厄，保佑平安' as description,
            800 as price,
            'year'::service_unit as unit
        FROM temples;

        INSERT INTO services (temple_id, icon, name, description, price, unit)
        SELECT
            id as temple_id,
            '📿' as icon,
            '平安符' as name,
            '隨身攜帶，趨吉避凶' as description,
            100 as price,
            'piece'::service_unit as unit
        FROM temples;
    END IF;
END $$;