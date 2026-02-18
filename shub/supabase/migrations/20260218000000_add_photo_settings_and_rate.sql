-- =============================================================================
-- Add photo_settings + ensure hourly_rate_text exists on worker_profiles
-- =============================================================================
-- Context:
--   The canonical home for worker profile data is worker_profiles (see
--   20260207000000_baseline_schema.sql). The columns added here are:
--
--     photo_settings   JSONB   — per-photo blur/watermark privacy flags
--                               keyed by photo URL:
--                               {"https://…/photo.jpg": {"blur":true,"watermark":false}}
--
--     hourly_rate_text already exists in worker_profiles per the baseline
--     schema but is guarded with IF NOT EXISTS for safety.
--
-- Note: the useWorkerProfile hook currently reads/writes the users table.
-- Until that hook is updated to query worker_profiles, the columns below
-- are also added to users (with IF NOT EXISTS) so the frontend continues
-- to work against whichever schema state the live DB is in.
-- =============================================================================

-- =============================================================================
-- 1. worker_profiles  (canonical location)
-- =============================================================================

ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS hourly_rate_text VARCHAR(300);

ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS photo_settings JSONB DEFAULT '{}'::jsonb;

-- photo_album already exists in worker_profiles per baseline schema.
-- No action needed.

-- =============================================================================
-- 2. users  (bridging — supports current frontend hook while it still
--    queries the users table directly)
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS hourly_rate_text VARCHAR(300);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS photo_settings JSONB DEFAULT '{}'::jsonb;

-- profile_photos mirrors worker_profiles.photo_album for the frontend hook.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_photos TEXT[] DEFAULT '{}';

-- status, status_message, primary_location, service_areas, languages,
-- qualification_documents — the frontend hook also reads these from users.
-- Guard each with IF NOT EXISTS so this is safe whether or not
-- 20260207000001_drop_bridging_columns has been applied.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status_message TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS primary_location VARCHAR(100);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS qualification_documents TEXT[] DEFAULT '{}';

-- =============================================================================
-- 3. Backfill bridging columns from worker_profiles for existing hosts
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
  AND u.role = 'worker';
