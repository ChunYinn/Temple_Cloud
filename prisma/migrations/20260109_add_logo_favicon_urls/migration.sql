-- Add logo_url and favicon_url columns to temples table
ALTER TABLE temples
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;