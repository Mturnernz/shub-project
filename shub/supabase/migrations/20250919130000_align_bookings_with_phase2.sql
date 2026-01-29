/*
  # Align bookings table with Phase 2 implementation

  This migration aligns the bookings table structure with the Phase 2 TypeScript schema:
  1. Rename 'host_id' column to 'worker_id' to match worker/client terminology
  2. Remove 'service_id' column (MVP doesn't use service-based bookings)
  3. Remove 'total_amount' column (MVP doesn't handle payments)
  4. Add 'updated_at' column for better tracking
  5. Update RLS policies to use new column names

  Changes:
  - host_id → worker_id
  - Remove service_id
  - Remove total_amount
  - Add updated_at column
  - Update indexes and policies
*/

-- First, drop the foreign key constraint on service_id
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

-- Rename host_id to worker_id
ALTER TABLE bookings RENAME COLUMN host_id TO worker_id;

-- Remove service_id and total_amount columns (MVP doesn't need these)
ALTER TABLE bookings DROP COLUMN IF EXISTS service_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount;

-- Add updated_at column if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop and recreate indexes with correct column names
DROP INDEX IF EXISTS idx_bookings_service_id;
DROP INDEX IF EXISTS idx_bookings_host_id;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON bookings(worker_id);

-- Update RLS policies to use worker_id instead of host_id
DROP POLICY IF EXISTS "Users can read their bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts and clients can update their bookings" ON bookings;

-- Recreate policies with correct column names
CREATE POLICY "Users can read their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR worker_id = auth.uid());

CREATE POLICY "Clients can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Workers and clients can update their bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR worker_id = auth.uid());