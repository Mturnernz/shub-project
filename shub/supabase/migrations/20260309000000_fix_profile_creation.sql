-- Fix profile creation RLS errors (42501)
--
-- Root cause (confirmed):
-- 001_initial_schema.sql created the users table with NO INSERT policy.
-- Later migrations added INSERT policies but these may not have been applied
-- to the live database. Additionally, useWorkerProfile.ts used
-- upsert(onConflict:'email'). When a public.users row exists with the same
-- email but a DIFFERENT UUID (orphaned row from a previous account attempt),
-- PostgreSQL's ON CONFLICT DO UPDATE tries to UPDATE that row. The UPDATE
-- policy USING check (auth.uid() = old_id) fails because the old row belongs
-- to a different UUID — raising exactly:
--   ERROR 42501: new row violates row-level security policy (USING expression)
--
-- Fixes:
-- A. SECURITY DEFINER function ensure_user_profile() — runs as DB owner,
--    bypasses RLS. Handles orphaned rows (same email, different UUID) by
--    deleting them first so the current auth user can create a fresh row.
-- B. Trigger on auth.users so the row is created at signup time before any
--    frontend query races against session setup.
-- C. Explicit WITH CHECK on the UPDATE policy so the USING expression is not
--    silently reused as the new-row check on any future upsert operations.
-- D. Ensure the INSERT policy exists (idempotent — safe to re-run).

-- =============================================================================
-- D. INSERT policy (may be missing from live DB if 003_fix_rls_policies.sql
--    was never applied)
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- C. Fix UPDATE policy: add explicit WITH CHECK
-- =============================================================================

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- A. ensure_user_profile RPC  (SECURITY DEFINER — bypasses RLS entirely)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id     UUID,
  p_email       TEXT,
  p_display_name TEXT,
  p_role        TEXT DEFAULT 'client'
)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove any orphaned row that has the same email but a different UUID.
  -- This happens when a user re-registers after their previous auth account
  -- was deleted. The old public.users row is inaccessible to the new auth
  -- user (different UUID → USING check blocks access), so deleting it loses
  -- nothing the user can actually reach. ON DELETE CASCADE cleans up child
  -- rows (worker_profiles etc.) automatically.
  DELETE FROM public.users
  WHERE email = p_email
    AND id    != p_user_id;

  -- Insert the row for the current auth user.
  -- ON CONFLICT (id) DO NOTHING means a second call is a safe no-op.
  INSERT INTO public.users (id, email, display_name, role, is_verified)
  VALUES (p_user_id, p_email, p_display_name, p_role, false)
  ON CONFLICT (id) DO NOTHING;

  -- For workers, ensure the worker_profiles companion row exists.
  IF p_role = 'worker' THEN
    INSERT INTO public.worker_profiles (
      user_id, bio, tagline, services, region, city,
      availability, photo_album, condoms_mandatory, published
    )
    VALUES (
      p_user_id, '', '', '{}', '', NULL,
      '{}', '{}', true, false
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Return the guaranteed row to the caller.
  RETURN QUERY SELECT * FROM public.users WHERE id = p_user_id;
END;
$$;

-- Only authenticated users may call this.
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

-- =============================================================================
-- B. Trigger: auto-create the public.users row at Supabase Auth signup time
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN NEW.raw_user_meta_data->>'type' IN ('host', 'worker') THEN 'worker'
      ELSE 'client'
    END,
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
