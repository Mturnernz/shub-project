-- Backfill worker_profiles.published = true for existing hosts whose publish
-- action was silently failing.
--
-- Root cause: useWorkerProfile.updateProfile was writing isPublished to
-- users.is_published (a column dropped by 20260207000001_drop_bridging_columns),
-- so the update threw an error and the worker_profiles.published = true write
-- was never reached. Hosts who clicked "Publish" remained invisible to clients.
--
-- Criteria: publish all worker profiles that have a non-empty bio.
-- A bio is required for 100% profile completion in the frontend, so any host
-- with a bio filled in actively set up their profile and intended to publish.

UPDATE public.worker_profiles
SET published = true
WHERE published = false
  AND bio IS NOT NULL
  AND bio != '';
