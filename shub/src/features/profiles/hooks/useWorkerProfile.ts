import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';

// ---------------------------------------------------------------------------
// Transform DB rows → frontend User type
// ---------------------------------------------------------------------------

const toProfile = (u: any, wp: any): User => ({
  id: u.id,
  name: u.display_name ?? '',
  email: u.email ?? '',
  role: u.role,
  avatar: u.avatar_url ?? u.avatar,
  verified: u.is_verified ?? false,
  isPublished: wp?.published ?? u.is_published ?? false,
  bio: wp?.bio ?? '',
  hourlyRateText: u.hourly_rate_text ?? '',
  profilePhotos: u.profile_photos ?? [],
  photoSettings: u.photo_settings ?? {},
  status: u.status ?? 'available',
  statusMessage: u.status_message ?? '',
  primaryLocation: u.primary_location ?? '',
  serviceAreas: u.service_areas ?? [],
  languages: u.languages ?? [],
  qualificationDocuments: u.qualification_documents ?? [],
  condomsMandatory: wp?.condoms_mandatory ?? true,
  location: u.location ?? '',
});

// ---------------------------------------------------------------------------
// Completion — what must be filled before a worker can publish
// ---------------------------------------------------------------------------

export interface ProfileCompletion {
  /** Fraction 0–100 */
  percent: number;
  /** Whether every required field is satisfied */
  isComplete: boolean;
  /** Per-field status so the UI can highlight what's missing */
  fields: {
    name: boolean;
    bio: boolean;
    location: boolean;
    photos: boolean;
    rates: boolean;
    condomsMandatory: boolean;
  };
}

const calcCompletion = (p: User | null): ProfileCompletion => {
  const empty: ProfileCompletion = {
    percent: 0,
    isComplete: false,
    fields: { name: false, bio: false, location: false, photos: false, rates: false, condomsMandatory: false },
  };
  if (!p) return empty;

  const fields = {
    name:             !!(p.name?.trim()),
    bio:              (p.bio?.length ?? 0) >= 100,
    location:         !!(p.primaryLocation?.trim()),
    photos:           (p.profilePhotos?.length ?? 0) >= 3,
    rates:            !!(p.hourlyRateText?.trim()),
    condomsMandatory: p.condomsMandatory === true,
  };

  const done = Object.values(fields).filter(Boolean).length;
  const total = Object.keys(fields).length;
  return { fields, percent: Math.round((done / total) * 100), isComplete: done === total };
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useWorkerProfile = (userId: string | undefined) => {
  const [profile, setProfile]   = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const completion = useMemo(() => calcCompletion(profile), [profile]);

  // -------------------------------------------------------------------------
  // Load
  // -------------------------------------------------------------------------

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch the users row. The signup trigger guarantees this exists;
      //    useAuthInit also creates it as a fallback. If it still doesn't
      //    exist the user needs to log out and back in.
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userErr) {
        throw new Error(
          'Your account profile could not be found. Please log out and sign in again.'
        );
      }

      // 2. Fetch the worker_profiles companion row.
      //    If it doesn't exist yet, create a blank one — the INSERT policy
      //    (user_id = auth.uid()) works here without any RPC.
      let wpData: any = null;
      const { data: wpFetched, error: wpErr } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (wpErr && wpErr.code !== 'PGRST116') {
        // Unexpected DB error — surface it
        throw new Error(`Failed to load profile settings: ${wpErr.message}`);
      }

      if (wpFetched) {
        wpData = wpFetched;
      } else {
        // First visit: initialise a blank worker_profiles row
        const { data: wpCreated, error: wpCreateErr } = await supabase
          .from('worker_profiles')
          .insert({
            user_id:           userId,
            bio:               '',
            tagline:           '',
            services:          [],
            region:            '',
            availability:      [],
            photo_album:       [],
            condoms_mandatory: true,
            published:         false,
          })
          .select('*')
          .single();

        if (wpCreateErr) {
          // Not fatal — profile can still load; publish will be unavailable
          console.error('Could not initialise worker_profiles row:', wpCreateErr.message);
        } else {
          wpData = wpCreated;
        }
      }

      setProfile(toProfile(userData, wpData));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Save — routes each field to the correct table
  // -------------------------------------------------------------------------

  const updateProfile = async (updates: Partial<User>) => {
    if (!userId || !profile) return;

    setSaving(true);
    setError(null);

    try {
      // Fields stored in public.users
      const userUpdates: Record<string, unknown> = {};
      if (updates.name             !== undefined) userUpdates.display_name           = updates.name;
      if (updates.bio              !== undefined) wpUpdates.bio                      = updates.bio;
      if (updates.profilePhotos    !== undefined) userUpdates.profile_photos         = updates.profilePhotos;
      if (updates.photoSettings    !== undefined) userUpdates.photo_settings         = updates.photoSettings;
      if (updates.status           !== undefined) userUpdates.status                 = updates.status;
      if (updates.statusMessage    !== undefined) userUpdates.status_message         = updates.statusMessage;
      if (updates.primaryLocation  !== undefined) userUpdates.primary_location       = updates.primaryLocation;
      if (updates.serviceAreas     !== undefined) userUpdates.service_areas          = updates.serviceAreas;
      if (updates.languages        !== undefined) userUpdates.languages              = updates.languages;
      if (updates.qualificationDocuments !== undefined) userUpdates.qualification_documents = updates.qualificationDocuments;
      if (updates.hourlyRateText   !== undefined) userUpdates.hourly_rate_text       = updates.hourlyRateText;

      // Fields stored in public.worker_profiles
      const wpUpdates: Record<string, unknown> = {};
      if (updates.condomsMandatory !== undefined) wpUpdates.condoms_mandatory = updates.condomsMandatory;

      const writes: Promise<any>[] = [];

      if (Object.keys(userUpdates).length > 0) {
        writes.push(
          supabase.from('users').update(userUpdates).eq('id', userId)
            .then(({ error: e }) => { if (e) throw e; })
        );
      }

      if (Object.keys(wpUpdates).length > 0) {
        writes.push(
          supabase.from('worker_profiles').update(wpUpdates).eq('user_id', userId)
            .then(({ error: e }) => { if (e) throw e; })
        );
      }

      await Promise.all(writes);
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
    } catch (err: any) {
      const msg = err?.message ?? 'Save failed';
      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Publish — only allowed when completion is 100 %
  // -------------------------------------------------------------------------

  const publishProfile = async () => {
    if (!userId || !profile) throw new Error('No profile loaded');
    if (!completion.isComplete) throw new Error('Profile is not complete yet');

    setSaving(true);
    setError(null);

    try {
      const [wpResult, userResult] = await Promise.all([
        supabase.from('worker_profiles').update({ published: true }).eq('user_id', userId),
        supabase.from('users').update({ is_published: true }).eq('id', userId),
      ]);

      if (wpResult.error) throw wpResult.error;
      if (userResult.error) throw userResult.error;

      setProfile(prev => prev ? { ...prev, isPublished: true } : prev);
    } catch (err: any) {
      const msg = err?.message ?? 'Publish failed';
      setError(msg);
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
    completion,
    updateProfile,
    publishProfile,
    refetch: fetchProfile,
  };
};
