import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';

const transformRow = (data: any): User => ({
  id: data.id,
  name: data.display_name || data.name,
  email: data.email,
  role: data.role,
  avatar: data.avatar_url || data.avatar,
  location: data.location,
  verified: data.is_verified || data.verified,
  isPublished: data.is_published,
  bio: data.bio,
  hourlyRateText: data.hourly_rate_text,
  profilePhotos: data.profile_photos || [],
  photoSettings: data.photo_settings || {},
  status: data.status || 'available',
  statusMessage: data.status_message,
  primaryLocation: data.primary_location,
  serviceAreas: data.service_areas || [],
  languages: data.languages || [],
  qualificationDocuments: data.qualification_documents || [],
});

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

      if (supabaseError) {
        // No row yet — create it so new hosts can start editing immediately.
        if (supabaseError.code === 'PGRST116') {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) throw new Error('Not authenticated');

          const metadata = authUser.user_metadata || {};
          const resolvedRole = (metadata.type === 'host' || metadata.type === 'worker')
            ? 'worker'
            : 'worker'; // profile editor is only reached by workers

          const displayName = metadata.name || authUser.email?.split('@')[0] || 'Host';

          // Use SECURITY DEFINER RPC instead of a raw upsert.
          // The previous upsert(onConflict:'email') could fail with 42501 because
          // the UPDATE policy's USING expression is also applied as WITH CHECK
          // (PostgreSQL behaviour when no WITH CHECK is specified), and upserts
          // that touch the id column trip that check on the new row.
          const { data: rpcRows, error: insertError } = await supabase
            .rpc('ensure_user_profile', {
              p_user_id:      userId,
              p_email:        authUser.email || '',
              p_display_name: displayName,
              p_role:         resolvedRole,
            });

          if (insertError) throw insertError;

          const created = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
          setProfile(transformRow(created));
          return;
        }
        throw supabaseError;
      }

      setProfile(transformRow(data));
    } catch (err: any) {
      console.error('Error fetching worker profile:', err);
      // Supabase PostgrestError is not an instanceof Error — surface its message
      // directly so we can see the real DB/RLS error rather than a generic string.
      const message = err?.message || err?.error_description || JSON.stringify(err) || 'Failed to fetch profile';
      setError(`Profile load error (${err?.code ?? 'unknown'}): ${message}`);
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
      if (updates.hourlyRateText !== undefined) dbUpdates.hourly_rate_text = updates.hourlyRateText;
      if (updates.photoSettings !== undefined) dbUpdates.photo_settings = updates.photoSettings;
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
