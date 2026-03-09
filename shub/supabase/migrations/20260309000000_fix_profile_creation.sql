-- Fix profile creation RLS errors (42501)
--
-- Root cause:
-- A public.users row exists with the same email but a different UUID than the
-- current auth session (orphaned from a prior account). useWorkerProfile's
-- upsert(onConflict:'email') tries to UPDATE that row; the UPDATE policy's
-- USING check (auth.uid() = old_id) fails → 42501 "(USING expression)".
--
-- Strategy: delete the orphaned row (and its dangling FK references) so the
-- current auth user can create a fresh row. Supabase restricts
-- session_replication_role even for the postgres role, so we manually delete
-- non-CASCADE FK dependents before deleting the users row.
--
-- Cascade map for public.users.id:
--   CASCADE  : worker_profiles, verification_docs (user_id), favorites,
--               blocked_users, availability_slots, services
--   NO CASCADE: bookings (worker_id, client_id), messages (sender_id,
--               recipient_id), reviews, reports (reporter_id), admin_audit,
--               safe_buddy_tokens
--   NULLABLE  : bookings.cancelled_by, verification_docs.reviewer_id,
--               reports.resolved_by  → SET NULL before deleting

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
    -- Nullify nullable FK columns that reference this user
    UPDATE public.bookings          SET cancelled_by = NULL WHERE cancelled_by = v_old_id;
    UPDATE public.verification_docs SET reviewer_id  = NULL WHERE reviewer_id  = v_old_id;
    UPDATE public.reports           SET resolved_by  = NULL WHERE resolved_by  = v_old_id;

    -- Delete non-CASCADE referencing rows (order matters: children before parents)
    DELETE FROM public.admin_audit        WHERE admin_id    = v_old_id;
    DELETE FROM public.safe_buddy_tokens  WHERE user_id     = v_old_id;
    DELETE FROM public.reviews            WHERE reviewer_id = v_old_id OR reviewee_id = v_old_id;
    DELETE FROM public.reports            WHERE reporter_id = v_old_id;
    DELETE FROM public.messages           WHERE sender_id   = v_old_id OR recipient_id = v_old_id;
    DELETE FROM public.bookings           WHERE worker_id   = v_old_id OR client_id    = v_old_id;

    -- Delete the orphaned users row; ON DELETE CASCADE handles the rest
    -- (worker_profiles, favorites, blocked_users, availability_slots,
    --  services, verification_docs via user_id)
    DELETE FROM public.users WHERE id = v_old_id;
  END IF;

  -- Insert the row for the current auth user (no-op if already exists)
  INSERT INTO public.users (id, email, display_name, role, is_verified)
  VALUES (p_user_id, p_email, p_display_name, p_role, false)
  ON CONFLICT (id) DO NOTHING;

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
