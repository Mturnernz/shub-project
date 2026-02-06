-- Fix browse page: align Shub 26 schema with deployed frontend expectations
-- The deployed frontend queries services with host:users!inner(status, created_at, is_published)
-- and expects columns like host_id, host_name, host_avatar, tags on services,
-- and is_published, type, status on users.

-- =============================================================================
-- 1. Add missing columns to users table
-- =============================================================================

-- 'type' column: frontend expects 'host'/'client', database has 'role' with 'worker'/'client'/'admin'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS type VARCHAR(20);
-- Map existing role values: worker -> host, client -> client, admin -> admin
UPDATE public.users SET type = CASE
  WHEN role = 'worker' THEN 'host'
  ELSE role
END WHERE type IS NULL;

-- 'name' column: frontend expects 'name', database has 'display_name'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
UPDATE public.users SET name = display_name WHERE name IS NULL;

-- 'is_published' column: controls public visibility of host profiles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 'status' column: availability status (available/busy/away)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';

-- 'bio' column: profile bio text
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 'verified' column: verification status
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
UPDATE public.users SET verified = is_verified WHERE verified = FALSE AND is_verified = TRUE;

-- 'avatar' column: frontend expects 'avatar', database has 'avatar_url'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
UPDATE public.users SET avatar = avatar_url WHERE avatar IS NULL AND avatar_url IS NOT NULL;

-- 'location' column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- 'deleted_at' column for soft deletes
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Populate is_published and other fields from worker_profiles where available
UPDATE public.users u
SET
  is_published = wp.published,
  bio = wp.bio,
  location = wp.region,
  status = 'available'
FROM worker_profiles wp
WHERE wp.user_id = u.id
  AND u.type = 'host';

-- =============================================================================
-- 2. Add missing columns to services table
-- =============================================================================

-- 'host_id' column: frontend expects host_id, database has worker_id
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.users(id);
UPDATE public.services SET host_id = worker_id WHERE host_id IS NULL;

-- 'host_name' column: denormalized host display name
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS host_name TEXT;
UPDATE public.services s SET host_name = u.display_name
FROM public.users u WHERE s.host_id = u.id AND s.host_name IS NULL;

-- 'host_avatar' column: denormalized host avatar
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS host_avatar TEXT;
UPDATE public.services s SET host_avatar = u.avatar_url
FROM public.users u WHERE s.host_id = u.id AND s.host_avatar IS NULL;

-- 'images' column: service images array
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 'tags' column: service tags array
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 'verified' column: whether service is verified/featured
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- 'rating' column: service rating
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0.0;

-- 'review_count' column
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 'available' column: frontend filters on available = true
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;
UPDATE public.services SET available = is_active WHERE available IS NULL;

-- 'location' column on services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS location VARCHAR(100);
UPDATE public.services s SET location = u.location
FROM public.users u WHERE s.host_id = u.id AND s.location IS NULL;

-- =============================================================================
-- 3. RLS policies for browse page
-- =============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read published host profiles
DROP POLICY IF EXISTS "Allow anon to read published host profiles" ON public.users;
CREATE POLICY "Allow anon to read published host profiles"
  ON public.users FOR SELECT TO anon
  USING (type = 'host' AND is_published = true AND deleted_at IS NULL);

-- Allow authenticated users to read published host profiles (the missing policy!)
DROP POLICY IF EXISTS "Authenticated users can read published host profiles" ON public.users;
CREATE POLICY "Authenticated users can read published host profiles"
  ON public.users FOR SELECT TO authenticated
  USING (type = 'host' AND is_published = true AND deleted_at IS NULL);

-- Allow anyone to read available services
DROP POLICY IF EXISTS "Anyone can read available services" ON public.services;
CREATE POLICY "Anyone can read available services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (available = true);

-- =============================================================================
-- 4. Mark seed host profiles as published so they appear on browse
-- =============================================================================

-- Publish all verified worker profiles
UPDATE public.users
SET is_published = true
WHERE type = 'host'
  AND verified = true
  AND is_published = false;
