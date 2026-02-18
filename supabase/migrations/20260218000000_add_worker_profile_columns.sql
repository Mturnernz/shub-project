-- Add missing worker-profile columns to the users table.
--
-- Context: profile data (bio, photos, location, languages, etc.) is stored
-- directly on the users table rather than in a separate worker_profiles table.
-- Several columns were never formally migrated. This migration adds them all,
-- plus two new columns introduced by the host-profile-creation feature:
--   • hourly_rate_text  – free-text rate description (wiki spec requirement)
--   • photo_settings    – per-photo blur/watermark privacy flags (wiki spec)

-- =============================================================================
-- Worker / host profile columns
-- =============================================================================

-- Free-text rate information displayed on the host's public profile.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS hourly_rate_text TEXT;

-- Per-photo privacy settings: JSON object mapping photo URL → {blur, watermark}.
-- Example: {"https://…/photo1.jpg": {"blur": true, "watermark": false}}
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS photo_settings JSONB DEFAULT '{}'::jsonb;

-- Ordered list of public profile photo URLs.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_photos TEXT[] DEFAULT '{}';

-- Short status message shown alongside availability (e.g. "Back Tuesday").
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status_message TEXT;

-- Primary city / region shown on the profile card.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS primary_location VARCHAR(100);

-- Array of service-area objects: [{city, radius}].
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]'::jsonb;

-- Array of language objects: [{language, proficiency}].
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Array of qualification/certification document URLs (private bucket).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS qualification_documents TEXT[] DEFAULT '{}';

-- Active view-mode for worker accounts that toggle between worker/client views.
-- Defaults to the user's base role.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS current_role VARCHAR(20);

-- Backfill current_role from role for existing rows.
UPDATE public.users
  SET current_role = role
  WHERE current_role IS NULL;

-- avatar_url: canonical avatar column (may already exist on older schemas).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- =============================================================================
-- Backfill profile data from worker_profiles where available
-- =============================================================================

UPDATE public.users u
SET
  hourly_rate_text = COALESCE(u.hourly_rate_text, wp.hourly_rate_text),
  profile_photos   = CASE
                       WHEN array_length(u.profile_photos, 1) IS NULL
                       THEN wp.photo_album
                       ELSE u.profile_photos
                     END,
  primary_location = COALESCE(u.primary_location, wp.region)
FROM public.worker_profiles wp
WHERE wp.user_id = u.id
  AND (u.role = 'worker' OR u.type = 'host');
