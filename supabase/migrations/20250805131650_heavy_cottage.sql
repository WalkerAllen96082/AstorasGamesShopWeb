/*
  # Add image field to banners table

  1. Changes
    - Add `image` column to `banners` table for storing banner image URLs
    - Column is optional (nullable) to maintain compatibility with existing banners

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'image'
  ) THEN
    ALTER TABLE banners ADD COLUMN image text;
  END IF;
END $$;