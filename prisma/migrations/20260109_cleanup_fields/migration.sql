-- Remove unnecessary fields
ALTER TABLE temples
  DROP COLUMN IF EXISTS subtitle,
  DROP COLUMN IF EXISTS google_maps_url,
  DROP COLUMN IF EXISTS youtube_url;

-- Add gallery photos array
ALTER TABLE temples
  ADD COLUMN IF NOT EXISTS gallery_photos TEXT[] DEFAULT '{}';