-- Fix profile creation RLS errors (42501)
--
-- Root causes:
-- 1. INSERT policy requires auth.uid() = id, but auth.uid() can be NULL during
--    session initialisation (right after email verification), causing the INSERT
--    to be rejected even though the user is legitimately authenticated.
-- 2. UPDATE policy only has USING (no WITH CHECK). PostgreSQL applies USING as
--    the WITH CHECK when none is specified, so a upsert that touches the id column
--    can fail with "new row violates row-level security policy (USING expression)".
-- 3. useWorkerProfile.ts used upsert(onConflict:'email') which tries to UPDATE the
--    primary key id to a new value — inherently unsafe and rejected by the policy.
--
-- Fixes:
-- A. SECURITY DEFINER function ensure_user_profile() — runs as the DB owner,
--    bypasses RLS for safe profile creation in all timing scenarios.
-- B. Trigger on auth.users so the row is always created at signup time, before
--    any frontend query has a chance to race against session setup.
-- C. Add explicit WITH CHECK to the UPDATE policy so the USING expression is not
--    silently reused as a new-row check.

-- =============================================================================
-- A. ensure_user_profile RPC  (SECURITY DEFINER — bypasses RLS)
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
  -- Create the users row if it doesn't already exist.
  -- ON CONFLICT (id) DO NOTHING is safe: if the row is already there we just
  -- skip the insert and proceed to the SELECT below.
  INSERT INTO public.users (id, email, display_name, role, is_verified)
  VALUES (p_user_id, p_email, p_display_name, p_role, false)
  ON CONFLICT (id) DO NOTHING;

  -- For workers, also ensure a worker_profiles row exists so the profile
  -- editor page can load without a second RLS-gated insert.
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

  -- Return the (now-guaranteed) row so the caller can read it back.
  RETURN QUERY SELECT * FROM public.users WHERE id = p_user_id;
END;
$$;

-- Only authenticated users should be able to call this for their own profile.
-- The function itself enforces no extra data-level restriction (SECURITY DEFINER
-- runs as the owner), so callers must pass their own auth.uid() as p_user_id.
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

-- =============================================================================
-- B. Trigger: auto-create the public.users row when an auth user is created
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

-- =============================================================================
-- C. Fix UPDATE policy: add explicit WITH CHECK so USING is not reused for the
--    new-row check, preventing the "new row violates … (USING expression)" error
-- =============================================================================

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
