/*
  # Create games table

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `cover` (text, image URL)
      - `name` (text, game name)
      - `size` (text, file size)
      - `year` (integer, release year)
      - `platform` (text, gaming platform)
      - `price` (numeric, price amount)
      - `currency` (text, USD or CUP)
      - `description` (text, game description)
      - `status` (text, newly_added or updated, nullable)
      - `views` (integer, view count)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `games` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cover text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  platform text NOT NULL DEFAULT 'PC Game',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'CUP')),
  description text NOT NULL DEFAULT '',
  status text CHECK (status IN ('newly_added', 'updated')),
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access to games
CREATE POLICY "Games are publicly readable"
  ON games
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert games
CREATE POLICY "Authenticated users can insert games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update games
CREATE POLICY "Authenticated users can update games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete games
CREATE POLICY "Authenticated users can delete games"
  ON games
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_views(game_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE games SET views = views + 1 WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();