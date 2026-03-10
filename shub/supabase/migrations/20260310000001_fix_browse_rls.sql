-- Ensure anon and authenticated roles can SELECT published worker profiles.
--
-- The baseline policy "Published worker profiles are viewable" has no TO clause,
-- which means it applies to all roles but relies on auth.uid() returning NULL
-- for anon. In some Supabase configurations this is insufficient. Replacing it
-- with an explicit two-policy approach makes the intent unambiguous.

DROP POLICY IF EXISTS "Published worker profiles are viewable" ON public.worker_profiles;

-- Anon: can read published profiles only
CREATE POLICY "Anon can read published worker profiles"
  ON public.worker_profiles FOR SELECT TO anon
  USING (published = true);

-- Authenticated: can read published profiles or their own (even if unpublished)
CREATE POLICY "Authenticated can read published worker profiles"
  ON public.worker_profiles FOR SELECT TO authenticated
  USING (published = true OR user_id = auth.uid());
