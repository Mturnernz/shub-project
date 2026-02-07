-- =============================================================================
-- CLEANUP: Drop bridging columns and align with canonical Shub 26 schema
-- =============================================================================
-- The migration 20260206000000 added duplicate columns (type, name, host_id,
-- host_name, host_avatar, etc.) to make the old frontend work with the Shub 26
-- database. Now that the frontend uses canonical naming, clean up.
-- =============================================================================

-- =============================================================================
-- 1. SERVICES — add canonical columns, migrate data, drop bridging columns
-- =============================================================================

-- Add canonical worker_name / worker_avatar columns
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS worker_name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS worker_avatar TEXT;

-- Copy data from bridging columns to canonical columns
UPDATE public.services
SET worker_name = host_name
WHERE worker_name IS NULL AND host_name IS NOT NULL;

UPDATE public.services
SET worker_avatar = host_avatar
WHERE worker_avatar IS NULL AND host_avatar IS NOT NULL;

-- Backfill any remaining nulls from users table
UPDATE public.services s
SET worker_name = u.display_name
FROM public.users u
WHERE s.worker_id = u.id
  AND (s.worker_name IS NULL OR s.worker_name = '');

UPDATE public.services s
SET worker_avatar = u.avatar_url
FROM public.users u
WHERE s.worker_id = u.id
  AND s.worker_avatar IS NULL
  AND u.avatar_url IS NOT NULL;

-- Now drop bridging columns
ALTER TABLE public.services DROP COLUMN IF EXISTS host_id;
ALTER TABLE public.services DROP COLUMN IF EXISTS host_name;
ALTER TABLE public.services DROP COLUMN IF EXISTS host_avatar;

-- =============================================================================
-- 2. USERS — drop bridging columns
-- =============================================================================

-- Drop old RLS policies that reference bridging columns
DROP POLICY IF EXISTS "Allow anon to read published host profiles"           ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read published host profiles" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by everyone"                       ON public.users;
DROP POLICY IF EXISTS "Users can read their own data"                        ON public.users;

-- 'type' was a mirror of 'role' with 'worker' mapped to 'host'
ALTER TABLE public.users DROP COLUMN IF EXISTS type;

-- 'name' was a mirror of 'display_name'
ALTER TABLE public.users DROP COLUMN IF EXISTS name;

-- 'is_published' was copied from worker_profiles.published
ALTER TABLE public.users DROP COLUMN IF EXISTS is_published;

-- 'status' was a string availability flag
ALTER TABLE public.users DROP COLUMN IF EXISTS status;

-- 'bio' was copied from worker_profiles.bio
ALTER TABLE public.users DROP COLUMN IF EXISTS bio;

-- 'verified' was a mirror of 'is_verified'
ALTER TABLE public.users DROP COLUMN IF EXISTS verified;

-- 'avatar' was a mirror of 'avatar_url'
ALTER TABLE public.users DROP COLUMN IF EXISTS avatar;

-- 'location' was copied from worker_profiles.region
ALTER TABLE public.users DROP COLUMN IF EXISTS location;

-- =============================================================================
-- 3. Create canonical RLS policies using worker_profiles for published check
-- =============================================================================

-- Users can always read their own record
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
CREATE POLICY "Users can read own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);

-- Anon can see published workers (via worker_profiles.published)
DROP POLICY IF EXISTS "Anon can read published worker profiles" ON public.users;
CREATE POLICY "Anon can read published worker profiles"
  ON public.users FOR SELECT TO anon
  USING (
    role = 'worker'
    AND EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.user_id = users.id AND wp.published = true
    )
    AND deleted_at IS NULL
  );

-- Authenticated can see published workers (via worker_profiles.published)
DROP POLICY IF EXISTS "Authenticated can read published worker profiles" ON public.users;
CREATE POLICY "Authenticated can read published worker profiles"
  ON public.users FOR SELECT TO authenticated
  USING (
    role = 'worker'
    AND EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.user_id = users.id AND wp.published = true
    )
    AND deleted_at IS NULL
  );

-- =============================================================================
-- 4. SERVICES — update RLS to only show services from published workers
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can read available services" ON public.services;
CREATE POLICY "Anyone can read available services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (
    available = true
    AND EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.user_id = services.worker_id AND wp.published = true
    )
  );

-- =============================================================================
-- 5. FAVORITES — drop old duplicate columns
-- =============================================================================
ALTER TABLE public.favorites DROP COLUMN IF EXISTS client_id;
ALTER TABLE public.favorites DROP COLUMN IF EXISTS worker_id;
