/*
  # Add is_published column to users table

  1. Schema Changes
    - Add `is_published` column to `users` table (boolean, defaults to false)
    - This column tracks whether a host has published their profile for client visibility

  2. Security
    - No changes to existing RLS policies needed
    - The new column inherits existing user data access controls
*/

-- Add is_published column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE users ADD COLUMN is_published boolean DEFAULT false;
  END IF;
END $$;