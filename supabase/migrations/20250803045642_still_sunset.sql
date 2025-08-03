/*
  # Add genre field to games table

  1. Changes
    - Add `genre` column to `games` table
    - Column is optional (nullable)
    - Only applies to PC Game platform
  
  2. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'genre'
  ) THEN
    ALTER TABLE games ADD COLUMN genre text;
  END IF;
END $$;