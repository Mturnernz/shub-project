import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore, type AppUserProfile } from '../stores/auth.store';

const transformSupabaseUserToProfile = (data: any): AppUserProfile => ({
  id: data.id,
  name: data.display_name,
  email: data.email,
  type: data.role === 'worker' ? 'host' : 'client',
  currentRole: data.role === 'worker' ? 'host' : 'client',
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found — create one for newly verified users
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const metadata = user.user_metadata;
        if (!metadata.name || !metadata.type) return null;

        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            display_name: metadata.name,
            email: user.email || '',
            role: metadata.type === 'host' ? 'worker' : 'client',
            is_verified: false,
          }])
          .select('*')
          .single();

        if (insertError) throw insertError;
        return transformSupabaseUserToProfile(newProfile);
      }
      throw error;
    }

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
