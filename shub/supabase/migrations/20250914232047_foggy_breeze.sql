/*
  # Add Host Profile Management Fields

  1. New Columns in Users Table
    - `bio` (text) - Host's detailed biography
    - `profile_photos` (text[]) - Array of profile photo URLs
    - `status` (text) - Availability status with check constraint
    - `status_message` (text) - Custom status message
    - `primary_location` (text) - Host's main location
    - `service_areas` (jsonb) - Service coverage areas with radius
    - `languages` (jsonb) - Languages and proficiency levels
    - `qualification_documents` (text[]) - URLs of certification documents

  2. New Columns in Services Table
    - `tags` (text[]) - Service tags for better categorization

  3. Security
    - Update RLS policies for profile management
    - Create storage buckets for profile photos and documents
*/

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photos text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_message text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_location text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_areas jsonb DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualification_documents text[] DEFAULT '{}';

-- Add check constraint for status
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('available', 'busy', 'away'));

-- Add new columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create storage buckets (these need to be created manually in Supabase dashboard)
-- Bucket: profile-photos (public read, authenticated upload)
-- Bucket: qualification-docs (private, authenticated only)

-- Update RLS policies for users table to allow profile updates
CREATE POLICY "Hosts can update their profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);