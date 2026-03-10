-- Fix "Database error saving new user" on signup
--
-- Root cause:
-- The handle_new_auth_user trigger uses ON CONFLICT (id) DO NOTHING, but if an
-- orphaned public.users row already exists with the same email and a different UUID
-- (e.g. from a deleted account), the INSERT raises a unique_violation on the email
-- column. Supabase Auth catches the uncaught exception and returns "Database error
-- saving new user" to the client.
--
-- Fix:
-- Wrap the INSERT in an exception handler so a unique_violation on email returns
-- gracefully. The new auth.users row is still created; ensure_user_profile() (called
-- on first app load via useAuthInit) handles the orphaned-row cleanup and creates the
-- public.users row for the new UUID.

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
EXCEPTION
  WHEN unique_violation THEN
    -- An orphaned public.users row exists with the same email but a different UUID.
    -- Return NEW so Supabase Auth succeeds; ensure_user_profile() will clean up the
    -- orphaned row and create a fresh public.users record on first login.
    RETURN NEW;
END;
$$;
