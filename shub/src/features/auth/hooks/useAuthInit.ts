import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, type AppUserProfile } from '../stores/auth.store';

const transformSupabaseUserToProfile = (data: any): AppUserProfile => ({
  id: data.id,
  name: data.display_name,
  email: data.email,
  role: data.role,
  currentRole: data.role,
  avatar: data.avatar_url,
  location: data.location,
  verified: data.is_verified,
  isPublished: data.is_published ?? false,
  bio: data.bio,
  profilePhotos: data.profile_photos || [],
  status: data.status || 'available',
  statusMessage: data.status_message,
  primaryLocation: data.primary_location,
  serviceAreas: data.service_areas || [],
  languages: data.languages || [],
  qualificationDocuments: data.qualification_documents || [],
});

/**
 * Build a minimal fallback profile from auth user data when the DB profile
 * cannot be fetched or created. This ensures authenticated users always
 * see at least client-level navigation instead of guest tabs.
 */
const buildFallbackProfile = (userId: string, email: string, metadata: Record<string, any> = {}): AppUserProfile => {
  const resolvedRole = (metadata.type === 'host' || metadata.type === 'worker')
    ? 'worker' as const
    : 'client' as const;

  return {
    id: userId,
    name: metadata.name || email.split('@')[0] || 'User',
    email,
    role: resolvedRole,
    currentRole: resolvedRole,
    verified: false,
    profilePhotos: [],
    status: 'available',
    serviceAreas: [],
    languages: [],
    qualificationDocuments: [],
  };
};

const fetchUserProfile = async (userId: string): Promise<AppUserProfile | null> => {
  try {
    console.log('Fetching user profile for:', userId);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Profile fetch error:', error.code, error.message);

      if (error.code === 'PGRST116') {
        console.log('No profile found, attempting to create one...');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No auth user found');
          return null;
        }

        console.log('Auth user metadata:', user.user_metadata);

        const metadata = user.user_metadata || {};

        // Resolve role from metadata, defaulting to 'client'
        const resolvedRole = (metadata.type === 'host' || metadata.type === 'worker')
          ? 'worker'
          : 'client';

        const newUser = {
          id: userId,
          display_name: metadata.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: resolvedRole,
          is_verified: false,
        };

        console.log('Inserting new user:', newUser);

        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select('*')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError.code, insertError.message, insertError.details);
          // Return a fallback profile so the user isn't stuck as guest
          return buildFallbackProfile(userId, user.email || '', metadata);
        }

        // Workers also need a worker_profiles row so they can access the profile editor
        if (resolvedRole === 'worker') {
          const { error: wpError } = await supabase
            .from('worker_profiles')
            .insert([{
              user_id: userId,
              bio: '',
              tagline: '',
              services: [],
              region: '',
              city: '',
              availability: [],
              photo_album: [],
              condoms_mandatory: true,
              published: false,
              photo_options: {},
              photo_settings: {},
            }]);
          if (wpError) {
            console.error('Failed to create worker_profiles row:', wpError.message);
          } else {
            console.log('Created worker_profiles row for new worker');
          }
        }

        console.log('Created new profile:', newProfile);
        return transformSupabaseUserToProfile(newProfile);
      }
      throw error;
    }

    console.log('Found existing profile:', data);
    return transformSupabaseUserToProfile(data);
  } catch (err) {
    console.error('Error fetching user profile:', err);

    // Last resort: build a fallback from auth user so they aren't stuck as guest
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return buildFallbackProfile(userId, user.email || '', user.user_metadata || {});
      }
    } catch {
      // ignore secondary failure
    }

    return null;
  }
};

export const useAuthInit = () => {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Safety net: if auth hasn't resolved within 4 seconds, unblock the UI.
    // This prevents a permanent loading spinner when the network is slow or
    // the Supabase session refresh hangs (e.g. wrong URL in env vars).
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('Auth init timed out — clearing loading state');
        setLoading(false);
      }
    }, 4000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (session?.user) {
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          clearTimeout(safetyTimer);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [setUser, setUserProfile, setLoading]);
};
