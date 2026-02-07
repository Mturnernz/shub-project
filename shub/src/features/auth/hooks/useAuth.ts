import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { User as AppUser } from '../../../types';

// Helper function to transform Supabase user data to AppUser
const transformSupabaseUserToAppUser = (data: any): AppUser => ({
  id: data.id,
  name: data.display_name || data.name,
  email: data.email,
  role: data.role,
  currentRole: data.current_role || data.role,
  avatar: data.avatar_url || data.avatar,
  location: data.location,
  verified: data.is_verified || data.verified,
  bio: data.bio,
  profilePhotos: data.profile_photos || [],
  status: data.status || 'available',
  statusMessage: data.status_message,
  primaryLocation: data.primary_location,
  serviceAreas: data.service_areas || [],
  languages: data.languages || [],
  qualificationDocuments: data.qualification_documents || [],
});

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<AppUser> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it for newly verified users
        if (error.code === 'PGRST116') { // No rows returned
          console.log('No profile found, creating profile for verified user');
          const newProfile = await createProfileForVerifiedUser(userId);
          setUserProfile(newProfile);
          return newProfile;
        }
        throw error;
      }

      const transformedProfile = transformSupabaseUserToAppUser(data);

      setUserProfile(transformedProfile);
      return transformedProfile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  };

  const createProfileForVerifiedUser = async (userId: string): Promise<AppUser> => {
    try {
      // Get user metadata from auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No authenticated user found');

      const userData = user.user_metadata;

      if (!userData.name || !userData.type) {
        throw new Error('Missing user metadata for profile creation');
      }

      console.log('Creating profile with metadata:', userData);

      // Map metadata.type to canonical role:
      // Old sign-ups sent 'host', new sign-ups send 'worker'
      const resolvedRole = (userData.type === 'host' || userData.type === 'worker')
        ? 'worker'
        : 'client';

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            display_name: userData.name,
            email: user.email || '',
            role: resolvedRole,
            is_verified: false,
          }
        ])
        .select('*')
        .single();

      if (insertError) throw insertError;

      console.log('Profile created successfully');

      return transformSupabaseUserToAppUser(newProfile);
    } catch (err) {
      console.error('Error creating profile for verified user:', err);
      throw err;
    }
  };

  // Helper function to handle authentication state changes
  const handleAuthChange = async (authUser: User | null) => {
    try {
      setUser(authUser);

      if (authUser) {
        await fetchUserProfile(authUser.id);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error handling auth change:', err);
      // Set userProfile to null on error to prevent infinite loading
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthChange(session?.user ?? null);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        await handleAuthChange(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    userProfile,
    loading,
    signOut,
    refetchProfile: () => user ? fetchUserProfile(user.id) : Promise.resolve(),
  };
};
