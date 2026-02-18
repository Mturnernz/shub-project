import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';

export const useWorkerProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (supabaseError) throw supabaseError;

      // Transform database fields to match our interface
      const transformedProfile: User = {
        id: data.id,
        name: data.display_name || data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar_url || data.avatar,
        location: data.location,
        verified: data.is_verified || data.verified,
        isPublished: data.is_published,
        bio: data.bio,
        profilePhotos: data.profile_photos || [],
        status: data.status || 'available',
        statusMessage: data.status_message,
        primaryLocation: data.primary_location,
        serviceAreas: data.service_areas || [],
        languages: data.languages || [],
        qualificationDocuments: data.qualification_documents || [],
      };

      setProfile(transformedProfile);
    } catch (err) {
      console.error('Error fetching worker profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!userId || !profile) return;

    try {
      setSaving(true);
      setError(null);

      // Transform our interface back to database fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.display_name = updates.name;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.profilePhotos !== undefined) dbUpdates.profile_photos = updates.profilePhotos;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.statusMessage !== undefined) dbUpdates.status_message = updates.statusMessage;
      if (updates.primaryLocation !== undefined) dbUpdates.primary_location = updates.primaryLocation;
      if (updates.serviceAreas !== undefined) dbUpdates.service_areas = updates.serviceAreas;
      if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
      if (updates.qualificationDocuments !== undefined) dbUpdates.qualification_documents = updates.qualificationDocuments;
      if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;

      console.log('Updating profile with:', dbUpdates);
      const { error: supabaseError } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId);

      if (supabaseError) throw supabaseError;

      console.log('Profile updated successfully');
      // Update local state
      setProfile({ ...profile, ...updates });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    refetch: fetchProfile,
  };
};
