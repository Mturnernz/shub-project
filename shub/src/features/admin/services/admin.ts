import { supabase } from '../../../lib/supabase';

// Types
export interface PendingVerification {
  id: string;
  user_id: string;
  role: 'worker' | 'client';
  selfie_url: string;
  id_front_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_resubmission';
  created_at: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    role: string;
    created_at: string;
  };
}

export interface UnpublishedProfile {
  id: string;
  user_id: string;
  bio: string | null;
  tagline: string | null;
  services: string[];
  region: string;
  city: string | null;
  hourly_rate_text: string | null;
  min_rate: number | null;
  max_rate: number | null;
  photo_album: string[];
  condoms_mandatory: boolean;
  published: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    is_verified: boolean;
    avatar_url: string | null;
  };
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, any>;
  created_at: string;
  admin?: {
    display_name: string;
    email: string;
  };
}

export interface AdminStats {
  pendingVerifications: number;
  unpublishedProfiles: number;
  openReports: number;
  totalUsers: number;
  totalWorkers: number;
  totalClients: number;
}

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<{ data: AdminStats | null; error: any }> => {
  try {
    // Get pending verifications count
    const { count: pendingVerifications } = await supabase
      .from('verification_docs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get unpublished but verified worker profiles
    const { count: unpublishedProfiles } = await supabase
      .from('worker_profiles')
      .select('*, users!inner(*)', { count: 'exact', head: true })
      .eq('published', false)
      .eq('users.is_verified', true);

    // Get open reports count
    const { count: openReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get workers count
    const { count: totalWorkers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'worker');

    // Get clients count
    const { count: totalClients } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    return {
      data: {
        pendingVerifications: pendingVerifications || 0,
        unpublishedProfiles: unpublishedProfiles || 0,
        openReports: openReports || 0,
        totalUsers: totalUsers || 0,
        totalWorkers: totalWorkers || 0,
        totalClients: totalClients || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { data: null, error };
  }
};

// Get pending verifications
export const getPendingVerifications = async (filters?: {
  status?: string;
  limit?: number;
}): Promise<{ data: PendingVerification[] | null; error: any }> => {
  try {
    let query = supabase
      .from('verification_docs')
      .select(`
        *,
        user:users(id, display_name, email, role, created_at)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'pending');
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as PendingVerification[], error: null };
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return { data: null, error };
  }
};

// Approve verification
export const approveVerification = async (
  verificationId: string,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the verification record
    const { data: verification, error: fetchError } = await supabase
      .from('verification_docs')
      .select('user_id')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      throw new Error('Verification not found');
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('verification_docs')
      .update({
        status: 'approved',
        reviewer_id: adminId,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', verificationId);

    if (updateError) throw updateError;

    // Update user is_verified status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', verification.user_id);

    if (userUpdateError) throw userUpdateError;

    // Log to admin audit
    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: 'verification_approved',
      target_type: 'verification',
      target_id: verificationId,
      details: { user_id: verification.user_id, notes },
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving verification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Reject verification
export const rejectVerification = async (
  verificationId: string,
  adminId: string,
  reason: string,
  allowResubmission: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: verification, error: fetchError } = await supabase
      .from('verification_docs')
      .select('user_id')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      throw new Error('Verification not found');
    }

    const { error: updateError } = await supabase
      .from('verification_docs')
      .update({
        status: allowResubmission ? 'requires_resubmission' : 'rejected',
        reviewer_id: adminId,
        reviewed_at: new Date().toISOString(),
        notes: reason,
      })
      .eq('id', verificationId);

    if (updateError) throw updateError;

    // Log to admin audit
    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: allowResubmission ? 'verification_requires_resubmission' : 'verification_rejected',
      target_type: 'verification',
      target_id: verificationId,
      details: { user_id: verification.user_id, reason, allowResubmission },
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get unpublished profiles (verified users with unpublished worker profiles)
export const getUnpublishedProfiles = async (filters?: {
  limit?: number;
}): Promise<{ data: UnpublishedProfile[] | null; error: any }> => {
  try {
    let query = supabase
      .from('worker_profiles')
      .select(`
        *,
        user:users!inner(id, display_name, email, is_verified, avatar_url)
      `)
      .eq('published', false)
      .eq('users.is_verified', true)
      .order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as UnpublishedProfile[], error: null };
  } catch (error) {
    console.error('Error fetching unpublished profiles:', error);
    return { data: null, error };
  }
};

// Publish a worker profile
export const publishProfile = async (
  userId: string,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is verified
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_verified')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    if (!user.is_verified) {
      throw new Error('User must be verified before publishing profile');
    }

    // Check if worker profile has condoms_mandatory set
    const { data: profile, error: profileError } = await supabase
      .from('worker_profiles')
      .select('condoms_mandatory, photo_album, bio')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Worker profile not found');
    }

    if (!profile.condoms_mandatory) {
      throw new Error('Profile must have condoms mandatory enabled');
    }

    // Update profile to published
    const { error: updateError } = await supabase
      .from('worker_profiles')
      .update({ published: true })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Log to admin audit
    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: 'profile_published',
      target_type: 'worker_profile',
      target_id: userId,
      details: { notes },
    });

    return { success: true };
  } catch (error) {
    console.error('Error publishing profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Unpublish a worker profile
export const unpublishProfile = async (
  userId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error: updateError } = await supabase
      .from('worker_profiles')
      .update({ published: false })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Log to admin audit
    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: 'profile_unpublished',
      target_type: 'worker_profile',
      target_id: userId,
      details: { reason },
    });

    return { success: true };
  } catch (error) {
    console.error('Error unpublishing profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get audit log
export const getAuditLog = async (filters?: {
  action?: string;
  adminId?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AuditLogEntry[] | null; count: number; error: any }> => {
  try {
    let query = supabase
      .from('admin_audit')
      .select(`
        *,
        admin:users!admin_id(display_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters?.targetType) {
      query = query.eq('target_type', filters.targetType);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return { data: data as AuditLogEntry[], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return { data: null, count: 0, error };
  }
};

// Get verification document signed URLs (for viewing in admin)
export const getVerificationDocUrls = async (
  selfiePathOrUrl: string,
  idFrontPathOrUrl: string
): Promise<{ selfieUrl: string; idFrontUrl: string }> => {
  // If already a full URL (legacy data), return as-is
  if (selfiePathOrUrl.startsWith('http')) {
    return { selfieUrl: selfiePathOrUrl, idFrontUrl: idFrontPathOrUrl };
  }

  try {
    // Generate signed URLs for private bucket
    const { data: selfieData } = await supabase.storage
      .from('id-documents')
      .createSignedUrl(selfiePathOrUrl, 60 * 60); // 1 hour expiry

    const { data: idData } = await supabase.storage
      .from('id-documents')
      .createSignedUrl(idFrontPathOrUrl, 60 * 60);

    return {
      selfieUrl: selfieData?.signedUrl || selfiePathOrUrl,
      idFrontUrl: idData?.signedUrl || idFrontPathOrUrl,
    };
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    return { selfieUrl: selfiePathOrUrl, idFrontUrl: idFrontPathOrUrl };
  }
};
