-- =============================================================================
-- CLEANUP: Drop bridging columns added by 20260206000000_fix_browse_rls.sql
-- =============================================================================
-- The previous migration (20260206) added duplicate columns to make the old
-- "host"-based frontend work with the Shub 26 database.  Now that the frontend
-- has been refactored to use the canonical naming (worker_id, role,
-- worker_profiles.published), these bridging columns are no longer needed.
--
-- What this migration drops:
--   users:    type, name, is_published, status, bio, verified, avatar,
--             location, deleted_at  (bridging aliases only — originals remain)
--   services: host_id, host_name, host_avatar
--
-- NOTE: Run this AFTER confirming the refactored frontend is deployed and stable.
-- =============================================================================

-- Drop old RLS policies that reference bridging columns
DROP POLICY IF EXISTS "Allow anon to read published host profiles"           ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read published host profiles" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by everyone"                       ON public.users;

-- =============================================================================
-- 1. USERS — drop bridging columns
-- =============================================================================
-- 'type' was a mirror of 'role' with 'worker' → 'host' mapping
ALTER TABLE public.users DROP COLUMN IF EXISTS type;

-- 'name' was a mirror of 'display_name'
ALTER TABLE public.users DROP COLUMN IF EXISTS name;

-- 'is_published' was copied from worker_profiles.published
ALTER TABLE public.users DROP COLUMN IF EXISTS is_published;

-- 'status' was a string availability flag; not used by canonical schema
-- (availability_slots table is the canonical source)
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
-- 2. SERVICES — drop bridging columns
-- =============================================================================
-- 'host_id' was a mirror of 'worker_id'
ALTER TABLE public.services DROP COLUMN IF EXISTS host_id;

-- 'host_name' was denormalised host display name (now worker_name)
ALTER TABLE public.services DROP COLUMN IF EXISTS host_name;

-- 'host_avatar' was denormalised host avatar (now worker_avatar)
ALTER TABLE public.services DROP COLUMN IF EXISTS host_avatar;

-- =============================================================================
-- 3. Migrate denormalised data if worker_name/worker_avatar are empty
-- =============================================================================
-- Ensure worker_name and worker_avatar are populated from users table
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

-- =============================================================================
-- 4. FAVORITES — drop old duplicate columns from initial migration
-- =============================================================================
-- The original favorites table had client_id/worker_id; the schema alignment
-- added user_id/favorited_user_id. Keep only the canonical pair.
ALTER TABLE public.favorites DROP COLUMN IF EXISTS client_id;
ALTER TABLE public.favorites DROP COLUMN IF EXISTS worker_id;
