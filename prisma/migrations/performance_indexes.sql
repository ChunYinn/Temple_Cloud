-- Add performance indexes for temple admin management queries

-- Index for faster order lookups by temple and status
CREATE INDEX IF NOT EXISTS idx_orders_temple_status ON orders(temple_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_temple_created ON orders(temple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_temple_type ON orders(temple_id, order_type);

-- Index for faster event lookups by temple and date
CREATE INDEX IF NOT EXISTS idx_events_temple_active ON events(temple_id, is_active);
CREATE INDEX IF NOT EXISTS idx_events_temple_date ON events(temple_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_registration ON events(temple_id, registration_deadline);

-- Index for faster temple stats queries
CREATE INDEX IF NOT EXISTS idx_temple_stats_lookup ON temple_stats(temple_id, date DESC);

-- Index for prayer services lookups (already exists in schema but adding for completeness)
CREATE INDEX IF NOT EXISTS idx_prayer_services_enabled ON temple_prayer_services(temple_id, is_enabled);

-- Index for donation settings lookups (unique constraint already provides index)
-- Already covered by unique constraint on temple_id

-- Index for services lookups
CREATE INDEX IF NOT EXISTS idx_services_temple_active ON services(temple_id, is_active, sort_order);

-- Index for temple members for faster permission checks
CREATE INDEX IF NOT EXISTS idx_temple_members_auth ON temple_members(auth_user_id, temple_id);

-- Composite indexes for common join queries
CREATE INDEX IF NOT EXISTS idx_orders_service_event ON orders(temple_id, service_id, event_id);

-- Index for gallery images
CREATE INDEX IF NOT EXISTS idx_gallery_temple_order ON gallery_images(temple_id, sort_order);

-- Add analysis command to update statistics for query planner
ANALYZE;