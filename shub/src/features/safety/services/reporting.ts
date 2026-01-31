import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/supabase';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export type ReportCategory =
  | 'unsafe_services'
  | 'underage_concern'
  | 'harassment'
  | 'fake_profile'
  | 'payment_fraud'
  | 'privacy_violation'
  | 'spam_scam'
  | 'threatening_behavior'
  | 'identity_theft'
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface ReportSubmission {
  reporter_id: string;
  target_type: 'user' | 'message' | 'booking' | 'profile';
  target_id: string;
  category: ReportCategory;
  description: string;
  evidence_urls?: string[];
  urgency: UrgencyLevel;
  additional_context?: {
    location?: string;
    time_of_incident?: string;
    witnesses?: string[];
    previous_incidents?: boolean;
  };
}

export interface ReportDetails extends Report {
  reporter?: {
    display_name: string;
    role: string;
  };
  target_user?: {
    display_name: string;
    role: string;
    is_verified: boolean;
  };
  target_content?: any;
  resolution_notes?: string;
  escalation_history?: Array<{
    timestamp: string;
    action: string;
    admin_id: string;
    notes: string;
  }>;
}

/**
 * Submit a new report
 */
export const submitReport = async (
  reportData: ReportSubmission
): Promise<{ success: boolean; reportId?: string; error?: string }> => {
  try {
    // Determine urgency based on category
    const urgency = determineUrgency(reportData.category, reportData.description);

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reportData.reporter_id,
        target_type: reportData.target_type,
        target_id: reportData.target_id,
        reason: reportData.category,
        description: reportData.description,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    // Handle emergency reports
    if (urgency === 'emergency') {
      await escalateEmergencyReport(data.id, reportData);
    }

    // Log the report submission
    await logReportAction(data.id, 'submitted', 'system', {
      category: reportData.category,
      urgency,
      auto_escalated: urgency === 'emergency'
    });

    return { success: true, reportId: data.id };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return { success: false, error: error.message || 'Failed to submit report' };
  }
};

/**
 * Get reports for admin dashboard
 */
export const getReports = async (
  filters?: {
    status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
    category?: ReportCategory;
    urgency?: UrgencyLevel;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: ReportDetails[] | null; error: any }> => {
  try {
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reporter_id(
          display_name,
          role
        ),
        target_user:users!target_id(
          display_name,
          role,
          is_verified
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('reason', filters.category);
    }

    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update report status
 */
export const updateReportStatus = async (
  reportId: string,
  status: 'open' | 'in_review' | 'resolved' | 'dismissed',
  adminId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) throw error;

    // Log the status update
    await logReportAction(reportId, `status_changed_to_${status}`, adminId, {
      notes,
      previous_status: status // Would need to fetch previous status in real implementation
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating report status:', error);
    return { success: false, error: error.message || 'Failed to update report status' };
  }
};

/**
 * Get report details by ID
 */
export const getReportById = async (reportId: string): Promise<{ data: ReportDetails | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reporter_id(
          display_name,
          role
        ),
        target_user:users!target_id(
          display_name,
          role,
          is_verified
        )
      `)
      .eq('id', reportId)
      .single();

    if (error) throw error;

    // Get related content based on target_type
    let targetContent = null;
    if (data.target_type === 'message') {
      const { data: messageData } = await supabase
        .from('messages')
        .select('content, booking_id, created_at')
        .eq('id', data.target_id)
        .single();
      targetContent = messageData;
    } else if (data.target_type === 'booking') {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('id', data.target_id)
        .single();
      targetContent = bookingData;
    }

    return {
      data: {
        ...data,
        target_content: targetContent
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get user's report history
 */
export const getUserReports = async (
  userId: string,
  type: 'submitted' | 'received'
): Promise<{ data: Report[] | null; error: any }> => {
  try {
    const column = type === 'submitted' ? 'reporter_id' : 'target_id';

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Block/unblock user
 */
export const toggleUserBlock = async (
  adminId: string,
  targetUserId: string,
  action: 'block' | 'unblock',
  reason: string,
  duration?: string // e.g., '7_days', 'permanent'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // In a real implementation, this would update a user_restrictions table
    // For now, we'll log the action in admin_audit

    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: `user_${action}`,
      target_type: 'user',
      target_id: targetUserId,
      details: {
        reason,
        duration,
        timestamp: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Error ${action}ing user:`, error);
    return { success: false, error: error.message || `Failed to ${action} user` };
  }
};

/**
 * Determine urgency level based on category and description
 */
const determineUrgency = (category: ReportCategory, description: string): UrgencyLevel => {
  // Emergency categories
  if (category === 'underage_concern' || category === 'threatening_behavior') {
    return 'emergency';
  }

  // High priority categories
  if (category === 'unsafe_services' || category === 'harassment') {
    return 'high';
  }

  // Check description for emergency keywords
  const emergencyKeywords = ['threat', 'danger', 'hurt', 'kill', 'suicide', 'minor', 'child', 'underage'];
  const lowercaseDescription = description.toLowerCase();

  if (emergencyKeywords.some(keyword => lowercaseDescription.includes(keyword))) {
    return 'emergency';
  }

  // Medium priority for most other categories
  if (['fake_profile', 'payment_fraud', 'privacy_violation'].includes(category)) {
    return 'medium';
  }

  return 'low';
};

/**
 * Handle emergency report escalation
 */
const escalateEmergencyReport = async (reportId: string, reportData: ReportSubmission): Promise<void> => {
  try {
    // Log emergency escalation
    await logReportAction(reportId, 'emergency_escalated', 'system', {
      category: reportData.category,
      escalation_time: new Date().toISOString(),
      requires_immediate_attention: true
    });

    // In a real implementation, this would:
    // 1. Send immediate notifications to senior moderators
    // 2. Create high-priority queue entry
    // 3. Potentially contact law enforcement for serious crimes
    // 4. Implement automatic temporary restrictions on reported user

    console.log(`Emergency report ${reportId} escalated for immediate review`);
  } catch (error) {
    console.error('Error escalating emergency report:', error);
  }
};

/**
 * Log report-related actions for audit trail
 */
const logReportAction = async (
  reportId: string,
  action: string,
  adminId: string,
  details?: any
): Promise<void> => {
  try {
    await supabase.from('admin_audit').insert({
      admin_id: adminId,
      action: `report_${action}`,
      target_type: 'report',
      target_id: reportId,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log report action:', error);
  }
};

/**
 * Get report statistics for admin dashboard
 */
export const getReportStatistics = async (timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  emergencyCount: number;
  averageResolutionTime: number;
}> => {
  try {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select('status, reason, created_at, updated_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const total = reports?.length || 0;
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let emergencyCount = 0;
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    reports?.forEach(report => {
      // Count by status
      byStatus[report.status] = (byStatus[report.status] || 0) + 1;

      // Count by category
      byCategory[report.reason] = (byCategory[report.reason] || 0) + 1;

      // Count emergency reports
      if (['underage_concern', 'threatening_behavior'].includes(report.reason)) {
        emergencyCount++;
      }

      // Calculate resolution time for resolved reports
      if (report.status === 'resolved' && report.updated_at) {
        const createdTime = new Date(report.created_at).getTime();
        const resolvedTime = new Date(report.updated_at).getTime();
        totalResolutionTime += resolvedTime - createdTime;
        resolvedCount++;
      }
    });

    const averageResolutionTime = resolvedCount > 0
      ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total,
      byStatus,
      byCategory,
      emergencyCount,
      averageResolutionTime
    };
  } catch (error) {
    console.error('Error getting report statistics:', error);
    return {
      total: 0,
      byStatus: {},
      byCategory: {},
      emergencyCount: 0,
      averageResolutionTime: 0
    };
  }
};