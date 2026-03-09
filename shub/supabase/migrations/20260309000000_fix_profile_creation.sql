-- Fix profile creation RLS errors (42501)
--
-- Root cause:
-- A public.users row exists with the same email but a different UUID than the
-- current auth session (orphaned from a prior account). useWorkerProfile's
-- upsert(onConflict:'email') tries to UPDATE that row; the UPDATE policy's
-- USING check (auth.uid() = old_id) fails → 42501 "(USING expression)".
--
-- Strategy: instead of deleting the orphaned row (which fails when FKs
-- reference it, e.g. bookings), we MIGRATE the UUID — rename the existing
-- row's primary key to match the current auth UUID, then fix all FK tables.
-- This preserves all the user's data (bookings, messages, etc.).
--
-- session_replication_role = replica temporarily disables FK enforcement
-- triggers so we can update the PK without violating referential integrity
-- mid-transaction. FKs are consistent again by the time the function returns.

-- =============================================================================
-- 1. INSERT policy (may be missing if 003_fix_rls_policies.sql was never run)
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. Fix UPDATE policy: add explicit WITH CHECK
-- =============================================================================

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 3. ensure_user_profile RPC  (SECURITY DEFINER — bypasses RLS)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id      UUID,
  p_email        TEXT,
  p_display_name TEXT,
  p_role         TEXT DEFAULT 'client'
)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_id UUID;
BEGIN
  -- Check for an orphaned row: same email, different UUID.
  SELECT id INTO v_old_id
  FROM public.users
  WHERE email = p_email AND id != p_user_id;

  IF v_old_id IS NOT NULL THEN
    -- Migrate the existing row to the new UUID rather than deleting it.
    -- This preserves all related data (bookings, messages, etc.).
    --
    -- Temporarily disable FK enforcement so we can update the PK first,
    -- then fix every referencing table.  The SECURITY DEFINER function runs
    -- as the postgres superuser, so SET LOCAL session_replication_role is
    -- permitted.  Using is_local=true means it reverts automatically when
    -- this transaction ends.
    PERFORM set_config('session_replication_role', 'replica', true);

    -- Rename the primary key
    UPDATE public.users SET id = p_user_id WHERE id = v_old_id;

    -- Fix every table that holds a FK reference to users.id
    UPDATE public.worker_profiles    SET user_id      = p_user_id WHERE user_id      = v_old_id;
    UPDATE public.bookings           SET worker_id    = p_user_id WHERE worker_id    = v_old_id;
    UPDATE public.bookings           SET client_id    = p_user_id WHERE client_id    = v_old_id;
    UPDATE public.bookings           SET cancelled_by = p_user_id WHERE cancelled_by = v_old_id;
    UPDATE public.messages           SET sender_id    = p_user_id WHERE sender_id    = v_old_id;
    UPDATE public.messages           SET recipient_id = p_user_id WHERE recipient_id = v_old_id;
    UPDATE public.reviews            SET reviewer_id  = p_user_id WHERE reviewer_id  = v_old_id;
    UPDATE public.reviews            SET reviewee_id  = p_user_id WHERE reviewee_id  = v_old_id;
    UPDATE public.reports            SET reporter_id  = p_user_id WHERE reporter_id  = v_old_id;
    UPDATE public.reports            SET resolved_by  = p_user_id WHERE resolved_by  = v_old_id;
    UPDATE public.verification_docs  SET user_id      = p_user_id WHERE user_id      = v_old_id;
    UPDATE public.verification_docs  SET reviewer_id  = p_user_id WHERE reviewer_id  = v_old_id;
    UPDATE public.services           SET worker_id    = p_user_id WHERE worker_id    = v_old_id;
    UPDATE public.availability_slots SET worker_id    = p_user_id WHERE worker_id    = v_old_id;
    UPDATE public.favorites          SET client_id    = p_user_id WHERE client_id    = v_old_id;
    UPDATE public.favorites          SET worker_id    = p_user_id WHERE worker_id    = v_old_id;
    UPDATE public.blocked_users      SET blocker_id   = p_user_id WHERE blocker_id   = v_old_id;
    UPDATE public.blocked_users      SET blocked_id   = p_user_id WHERE blocked_id   = v_old_id;
    UPDATE public.safe_buddy_tokens  SET user_id      = p_user_id WHERE user_id      = v_old_id;
    UPDATE public.admin_audit        SET admin_id     = p_user_id WHERE admin_id     = v_old_id;

    -- Restore normal FK enforcement
    PERFORM set_config('session_replication_role', 'origin', true);

  ELSE
    -- No orphaned row: simple insert (no-op if row already exists)
    INSERT INTO public.users (id, email, display_name, role, is_verified)
    VALUES (p_user_id, p_email, p_display_name, p_role, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure worker_profiles companion row exists for workers
  IF p_role = 'worker' THEN
    INSERT INTO public.worker_profiles (
      user_id, bio, tagline, services, region, city,
      availability, photo_album, condoms_mandatory, published
    )
    VALUES (p_user_id, '', '', '{}', '', NULL, '{}', '{}', true, false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN QUERY SELECT * FROM public.users WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

-- =============================================================================
-- 4. Trigger: auto-create the public.users row at Supabase Auth signup
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
