/*
  # Update bookings table schema

  This migration updates the bookings table to match the Phase 2 implementation:
  1. Replace single 'date' column with 'start_time' and 'end_time' columns
  2. Update the schema to match the TypeScript interface expectations
  3. Preserve existing data by copying 'date' to 'start_time' and calculating 'end_time'

  Changes:
  - Remove 'date' column
  - Add 'start_time' timestamptz column
  - Add 'end_time' timestamptz column
  - Update existing data to use the new columns
*/

-- Add new columns first
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS start_time timestamptz,
ADD COLUMN IF NOT EXISTS end_time timestamptz;

-- Copy existing date data to start_time and calculate end_time
-- (assuming 1 hour duration as default, this can be adjusted based on service duration)
UPDATE bookings
SET start_time = date,
    end_time = date + INTERVAL '1 hour'
WHERE start_time IS NULL;

-- Make the new columns NOT NULL after data migration
ALTER TABLE bookings
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;

-- Drop the old date column
ALTER TABLE bookings DROP COLUMN IF EXISTS date;

-- Add check constraint to ensure end_time is after start_time
ALTER TABLE bookings
ADD CONSTRAINT check_booking_time_order
CHECK (end_time > start_time);

-- Create indexes for the new time columns for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON bookings(end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON bookings(start_time, end_time);