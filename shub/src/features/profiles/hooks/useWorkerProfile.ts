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

      // bio and published live in worker_profiles (they were removed from users
      // by the drop_bridging_columns migration — 20260207000001)
      let bio: string | undefined;
      let isPublished = false;
      if (data.role === 'worker') {
        const { data: wp } = await supabase
          .from('worker_profiles')
          .select('bio, published')
          .eq('user_id', userId)
          .single();
        if (wp) {
          bio = wp.bio || undefined;
          isPublished = wp.published ?? false;
        }
      }

      // Transform database fields to match our interface
      const transformedProfile: User = {
        id: data.id,
        name: data.display_name || data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar_url || data.avatar,
        location: data.location,
        verified: data.is_verified || data.verified,
        isPublished,
        bio,
        hourlyRateText: data.hourly_rate_text,
        profilePhotos: data.profile_photos || [],
        photoSettings: data.photo_settings || {},
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

      // Fields that live on the users table
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.display_name = updates.name;
      if (updates.profilePhotos !== undefined) dbUpdates.profile_photos = updates.profilePhotos;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.statusMessage !== undefined) dbUpdates.status_message = updates.statusMessage;
      if (updates.primaryLocation !== undefined) dbUpdates.primary_location = updates.primaryLocation;
      if (updates.serviceAreas !== undefined) dbUpdates.service_areas = updates.serviceAreas;
      if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
      if (updates.qualificationDocuments !== undefined) dbUpdates.qualification_documents = updates.qualificationDocuments;
      if (updates.hourlyRateText !== undefined) dbUpdates.hourly_rate_text = updates.hourlyRateText;
      if (updates.photoSettings !== undefined) dbUpdates.photo_settings = updates.photoSettings;

      if (Object.keys(dbUpdates).length > 0) {
        console.log('Updating users table with:', dbUpdates);
        const { error: supabaseError } = await supabase
          .from('users')
          .update(dbUpdates)
          .eq('id', userId);
        if (supabaseError) throw supabaseError;
      }

      // bio and published live in worker_profiles (removed from users by
      // the drop_bridging_columns migration — 20260207000001)
      const wpUpdates: any = {};
      if (updates.bio !== undefined) wpUpdates.bio = updates.bio;
      if (updates.isPublished !== undefined) wpUpdates.published = updates.isPublished;

      if (Object.keys(wpUpdates).length > 0) {
        console.log('Updating worker_profiles with:', wpUpdates);
        const { error: wpError } = await supabase
          .from('worker_profiles')
          .update(wpUpdates)
          .eq('user_id', userId);
        if (wpError) throw wpError;
      }

      console.log('Profile updated successfully');
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
