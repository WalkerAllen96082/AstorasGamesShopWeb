/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text, service name)
      - `price` (numeric, price amount)
      - `currency` (text, USD or CUP)
      - `description` (text, service description)
      - `cover` (text, image URL)
      - `duration` (text, service duration)
      - `status` (text, newly_added or updated, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `services` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'CUP')),
  description text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  status text CHECK (status IN ('newly_added', 'updated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services
CREATE POLICY "Services are publicly readable"
  ON services
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert services
CREATE POLICY "Authenticated users can insert services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update services
CREATE POLICY "Authenticated users can update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete services
CREATE POLICY "Authenticated users can delete services"
  ON services
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger for services
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();