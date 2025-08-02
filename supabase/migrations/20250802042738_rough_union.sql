/*
  # Create banners table

  1. New Tables
    - `banners`
      - `id` (uuid, primary key)
      - `title` (text, banner title)
      - `content` (text, banner content)
      - `active` (boolean, whether banner is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `banners` table
    - Add policy for public read access to active banners
    - Add policy for authenticated users to manage banners

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active banners
CREATE POLICY "Public can read active banners"
  ON banners
  FOR SELECT
  TO public
  USING (active = true);

-- Policy for authenticated users to manage all banners
CREATE POLICY "Authenticated users can manage banners"
  ON banners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample banner
INSERT INTO banners (title, content, active) VALUES
  ('¡Bienvenido a la Tienda de Juegos de Astora!', 'Descubre los mejores juegos, productos y servicios. ¡Ofertas especiales disponibles!', true)
ON CONFLICT DO NOTHING;