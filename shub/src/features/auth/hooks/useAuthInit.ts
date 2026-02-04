import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, type AppUserProfile } from '../stores/auth.store';

const mapRoleToType = (role: string): 'host' | 'client' | 'admin' => {
  if (role === 'admin') return 'admin';
  if (role === 'worker') return 'host';
  return 'client';
};

const transformSupabaseUserToProfile = (data: any): AppUserProfile => ({
  id: data.id,
  name: data.display_name,
  email: data.email,
  type: mapRoleToType(data.role),
  currentRole: mapRoleToType(data.role),
  avatar: data.avatar_url,
  location: data.location,
  verified: data.is_verified,
  bio: data.bio,
  profilePhotos: data.profile_photos || [],
  status: data.status || 'available',
  statusMessage: data.status_message,
  primaryLocation: data.primary_location,
  serviceAreas: data.service_areas || [],
  languages: data.languages || [],
  qualificationDocuments: data.qualification_documents || [],
});

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
        // No profile found — create one for newly verified users
        console.log('No profile found, attempting to create one...');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No auth user found');
          return null;
        }

        console.log('Auth user metadata:', user.user_metadata);

        const metadata = user.user_metadata;
        if (!metadata.name || !metadata.type) {
          console.error('Missing required metadata (name or type):', metadata);
          return null;
        }

        const newUser = {
          id: userId,
          display_name: metadata.name,
          email: user.email || '',
          role: metadata.type === 'host' ? 'worker' : 'client',
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
          throw insertError;
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
    return null;
  }
};

export const useAuthInit = () => {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

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
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

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
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setUserProfile, setLoading]);
};
