import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, type AppUserProfile } from '../stores/auth.store';

// ---------------------------------------------------------------------------
// Transform a public.users DB row into the app's AppUserProfile shape
// ---------------------------------------------------------------------------

const toAppProfile = (row: any): AppUserProfile => ({
  id:                     row.id,
  name:                   row.display_name ?? '',
  email:                  row.email ?? '',
  role:                   row.role,
  currentRole:            row.role,
  avatar:                 row.avatar_url,
  verified:               row.is_verified ?? false,
  isPublished:            row.is_published ?? false,
  bio:                    row.bio,
  profilePhotos:          row.profile_photos ?? [],
  status:                 row.status ?? 'available',
  statusMessage:          row.status_message,
  primaryLocation:        row.primary_location,
  serviceAreas:           row.service_areas ?? [],
  languages:              row.languages ?? [],
  qualificationDocuments: row.qualification_documents ?? [],
});

// ---------------------------------------------------------------------------
// Fetch the user's public.users row.
// The signup trigger (handle_new_auth_user) creates this row automatically,
// so for normal logins a simple SELECT is all that's needed.
// If the row is missing (e.g. the trigger wasn't applied yet, or the user
// was created before the trigger existed) we fall back to the
// ensure_user_profile RPC which creates the row safely.
// ---------------------------------------------------------------------------

const fetchUserProfile = async (userId: string): Promise<AppUserProfile | null> => {
  // 1. Try reading the existing row
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error) return toAppProfile(data);

  // Row doesn't exist — attempt to create it via the SECURITY DEFINER RPC
  if (error.code === 'PGRST116') {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const meta = authUser.user_metadata ?? {};
    const role = (meta.type === 'host' || meta.type === 'worker') ? 'worker' : 'client';

    const { data: rpcRows, error: rpcErr } = await supabase.rpc('ensure_user_profile', {
      p_user_id:      userId,
      p_email:        authUser.email ?? '',
      p_display_name: meta.name ?? authUser.email?.split('@')[0] ?? 'User',
      p_role:         role,
    });

    if (rpcErr) {
      // RPC not deployed yet or another error — return a minimal in-memory profile
      // so the user isn't stuck on a loading screen, but don't persist anything.
      console.error('ensure_user_profile failed:', rpcErr.message);
      return {
        id:                     userId,
        name:                   meta.name ?? authUser.email?.split('@')[0] ?? 'User',
        email:                  authUser.email ?? '',
        role:                   role as 'worker' | 'client',
        currentRole:            role as 'worker' | 'client',
        verified:               false,
        isPublished:            false,
        profilePhotos:          [],
        status:                 'available',
        serviceAreas:           [],
        languages:              [],
        qualificationDocuments: [],
      };
    }

    const created = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
    return toAppProfile(created);
  }

  // Any other DB error
  console.error('Profile fetch error:', error.message);
  return null;
};

// ---------------------------------------------------------------------------
// Hook — called once from App root to initialise auth state
// ---------------------------------------------------------------------------

export const useAuthInit = () => {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Safety net: clear loading after 5 s in case Supabase hangs
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUserProfile(profile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        clearTimeout(timeout);
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return;
        try {
          if (session?.user) {
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) setUserProfile(profile);
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          clearTimeout(timeout);
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setUser, setUserProfile, setLoading]);
};
