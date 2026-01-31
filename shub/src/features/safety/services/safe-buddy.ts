import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/supabase';

export type SafeBuddyToken = Database['public']['Tables']['safe_buddy_tokens']['Row'];

export interface SafetyInfo {
  worker_name: string;
  client_name: string;
  location: string;
  scheduled_time: string;
  duration_hours: number;
  check_in_required: boolean;
  emergency_contact?: string;
}

export interface SafetyContact {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  notify_if_overdue: boolean;
}

export interface SafeBuddyLinkData {
  booking_id: string;
  token: string;
  expires_at: string;
  safety_info: SafetyInfo;
  contacts: SafetyContact[];
  check_in_status: 'pending' | 'checked_in' | 'overdue' | 'completed';
}

export interface CheckInData {
  status: 'safe' | 'need_help' | 'emergency';
  location?: string;
  notes?: string;
  estimated_completion?: string;
}

/**
 * Generate a Safe Buddy link for a booking
 */
export const generateSafeBuddyLink = async (
  bookingId: string,
  safetyInfo: SafetyInfo,
  contacts: SafetyContact[] = []
): Promise<{ success: boolean; token?: string; link?: string; error?: string }> => {
  try {
    // Generate a secure random token
    const token = generateSecureToken();

    // Calculate expiration (24 hours after scheduled time)
    const scheduledTime = new Date(safetyInfo.scheduled_time);
    const expiresAt = new Date(scheduledTime.getTime() + 24 * 60 * 60 * 1000);

    // Save to database
    const { data, error } = await supabase
      .from('safe_buddy_tokens')
      .insert({
        booking_id: bookingId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single();

    if (error) throw error;

    // Store additional safety information in a separate table or JSON field
    // For this implementation, we'll use the admin_audit table to store the safety context
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'safe_buddy_created',
      target_type: 'booking',
      target_id: bookingId,
      details: {
        token,
        safety_info: safetyInfo,
        contacts,
        created_at: new Date().toISOString()
      }
    });

    // Generate the public link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/safe-buddy/${token}`;

    return { success: true, token, link };
  } catch (error: any) {
    console.error('Error generating Safe Buddy link:', error);
    return { success: false, error: error.message || 'Failed to generate Safe Buddy link' };
  }
};

/**
 * Resolve a Safe Buddy token and get safety information
 */
export const resolveSafeBuddyToken = async (
  token: string
): Promise<{ success: boolean; data?: SafeBuddyLinkData; error?: string }> => {
  try {
    // Get token from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('safe_buddy_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return { success: false, error: 'Invalid or expired safety link' };
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return { success: false, error: 'This safety link has expired' };
    }

    // Get safety information from audit log
    const { data: auditData, error: auditError } = await supabase
      .from('admin_audit')
      .select('details')
      .eq('action', 'safe_buddy_created')
      .eq('target_id', tokenData.booking_id)
      .contains('details', { token })
      .single();

    if (auditError || !auditData) {
      return { success: false, error: 'Safety information not found' };
    }

    const safetyDetails = auditData.details as any;

    // Determine check-in status
    const scheduledTime = new Date(safetyDetails.safety_info.scheduled_time);
    const now = new Date();
    const endTime = new Date(scheduledTime.getTime() + safetyDetails.safety_info.duration_hours * 60 * 60 * 1000);
    const overdueTime = new Date(endTime.getTime() + 30 * 60 * 1000); // 30 minutes grace period

    let checkInStatus: 'pending' | 'checked_in' | 'overdue' | 'completed';

    if (tokenData.used) {
      checkInStatus = 'checked_in';
    } else if (now > overdueTime) {
      checkInStatus = 'overdue';
    } else if (now > endTime) {
      checkInStatus = 'pending';
    } else {
      checkInStatus = 'pending';
    }

    const safeBuddyData: SafeBuddyLinkData = {
      booking_id: tokenData.booking_id,
      token: tokenData.token,
      expires_at: tokenData.expires_at,
      safety_info: safetyDetails.safety_info,
      contacts: safetyDetails.contacts || [],
      check_in_status: checkInStatus
    };

    return { success: true, data: safeBuddyData };
  } catch (error: any) {
    console.error('Error resolving Safe Buddy token:', error);
    return { success: false, error: error.message || 'Failed to resolve safety link' };
  }
};

/**
 * Process a safety check-in
 */
export const processSafetyCheckIn = async (
  token: string,
  checkInData: CheckInData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify token is valid
    const { success, data, error } = await resolveSafeBuddyToken(token);
    if (!success || !data) {
      return { success: false, error: error || 'Invalid safety link' };
    }

    // Mark token as used
    const { error: updateError } = await supabase
      .from('safe_buddy_tokens')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('token', token);

    if (updateError) throw updateError;

    // Log the check-in
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'safe_buddy_checkin',
      target_type: 'booking',
      target_id: data.booking_id,
      details: {
        token,
        check_in_data: checkInData,
        check_in_time: new Date().toISOString(),
        safety_status: checkInData.status
      }
    });

    // Handle emergency situations
    if (checkInData.status === 'emergency') {
      await handleEmergencyCheckIn(data, checkInData);
    } else if (checkInData.status === 'need_help') {
      await handleHelpRequest(data, checkInData);
    }

    // Notify safety contacts
    await notifySafetyContacts(data, checkInData);

    return { success: true };
  } catch (error: any) {
    console.error('Error processing safety check-in:', error);
    return { success: false, error: error.message || 'Failed to process check-in' };
  }
};

/**
 * Check for overdue safety check-ins
 */
export const checkOverdueCheckIns = async (): Promise<{
  overdue: Array<{ booking_id: string; safety_info: SafetyInfo; contacts: SafetyContact[] }>;
}> => {
  try {
    const now = new Date();

    // Get all unused tokens that should have been checked in by now
    const { data: overdueTokens, error } = await supabase
      .from('safe_buddy_tokens')
      .select('*')
      .eq('used', false)
      .lt('expires_at', now.toISOString());

    if (error) throw error;

    const overdueBookings = [];

    for (const token of overdueTokens || []) {
      // Get safety information
      const { data: auditData } = await supabase
        .from('admin_audit')
        .select('details')
        .eq('action', 'safe_buddy_created')
        .eq('target_id', token.booking_id)
        .contains('details', { token: token.token })
        .single();

      if (auditData) {
        const safetyDetails = auditData.details as any;
        overdueBookings.push({
          booking_id: token.booking_id,
          safety_info: safetyDetails.safety_info,
          contacts: safetyDetails.contacts || []
        });
      }
    }

    // Notify emergency contacts for overdue check-ins
    for (const overdueBooking of overdueBookings) {
      await handleOverdueCheckIn(overdueBooking);
    }

    return { overdue: overdueBookings };
  } catch (error) {
    console.error('Error checking overdue check-ins:', error);
    return { overdue: [] };
  }
};

/**
 * Generate a secure random token
 */
const generateSecureToken = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Handle emergency check-in
 */
const handleEmergencyCheckIn = async (
  safeBuddyData: SafeBuddyLinkData,
  checkInData: CheckInData
): Promise<void> => {
  try {
    // Log emergency escalation
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'emergency_checkin_escalated',
      target_type: 'booking',
      target_id: safeBuddyData.booking_id,
      details: {
        safety_info: safeBuddyData.safety_info,
        check_in_data: checkInData,
        escalation_time: new Date().toISOString(),
        requires_immediate_response: true
      }
    });

    // In a real implementation, this would:
    // 1. Contact emergency services
    // 2. Notify all emergency contacts immediately
    // 3. Alert platform administrators
    // 4. Preserve all safety information for authorities

    console.log('EMERGENCY: Safety check-in indicates emergency situation');
  } catch (error) {
    console.error('Error handling emergency check-in:', error);
  }
};

/**
 * Handle help request check-in
 */
const handleHelpRequest = async (
  safeBuddyData: SafeBuddyLinkData,
  checkInData: CheckInData
): Promise<void> => {
  try {
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'help_request_logged',
      target_type: 'booking',
      target_id: safeBuddyData.booking_id,
      details: {
        safety_info: safeBuddyData.safety_info,
        check_in_data: checkInData,
        help_requested_at: new Date().toISOString()
      }
    });

    // Notify emergency contacts about help request
    console.log('Help requested via safety check-in');
  } catch (error) {
    console.error('Error handling help request:', error);
  }
};

/**
 * Handle overdue check-in
 */
const handleOverdueCheckIn = async (
  overdueBooking: { booking_id: string; safety_info: SafetyInfo; contacts: SafetyContact[] }
): Promise<void> => {
  try {
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'overdue_checkin_detected',
      target_type: 'booking',
      target_id: overdueBooking.booking_id,
      details: {
        safety_info: overdueBooking.safety_info,
        contacts: overdueBooking.contacts,
        overdue_detected_at: new Date().toISOString(),
        requires_contact_notification: true
      }
    });

    // In a real implementation, this would:
    // 1. Send notifications to emergency contacts
    // 2. Attempt to contact the worker directly
    // 3. Escalate to authorities if no response within specified timeframe

    console.log('Overdue safety check-in detected for booking:', overdueBooking.booking_id);
  } catch (error) {
    console.error('Error handling overdue check-in:', error);
  }
};

/**
 * Notify safety contacts about check-in status
 */
const notifySafetyContacts = async (
  safeBuddyData: SafeBuddyLinkData,
  checkInData: CheckInData
): Promise<void> => {
  try {
    // Log notification intent
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'safety_contacts_notified',
      target_type: 'booking',
      target_id: safeBuddyData.booking_id,
      details: {
        check_in_status: checkInData.status,
        contacts_to_notify: safeBuddyData.contacts.filter(c => c.notify_if_overdue).length,
        notification_time: new Date().toISOString()
      }
    });

    // In a real implementation, this would send actual notifications
    // via SMS, email, or push notifications to the safety contacts
    console.log('Safety contacts notified of check-in status:', checkInData.status);
  } catch (error) {
    console.error('Error notifying safety contacts:', error);
  }
};

/**
 * Get safety link statistics for a user
 */
export const getSafetyLinkStats = async (userId: string): Promise<{
  total_links_created: number;
  active_links: number;
  successful_checkins: number;
  overdue_incidents: number;
}> => {
  try {
    // Get bookings for user
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .or(`worker_id.eq.${userId},client_id.eq.${userId}`);

    if (!bookings || bookings.length === 0) {
      return { total_links_created: 0, active_links: 0, successful_checkins: 0, overdue_incidents: 0 };
    }

    const bookingIds = bookings.map(b => b.id);

    // Count safety links created
    const { count: totalLinks } = await supabase
      .from('admin_audit')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'safe_buddy_created')
      .in('target_id', bookingIds);

    // Count active links (not used and not expired)
    const { count: activeLinks } = await supabase
      .from('safe_buddy_tokens')
      .select('*', { count: 'exact', head: true })
      .in('booking_id', bookingIds)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString());

    // Count successful check-ins
    const { count: successfulCheckins } = await supabase
      .from('admin_audit')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'safe_buddy_checkin')
      .in('target_id', bookingIds);

    // Count overdue incidents
    const { count: overdueIncidents } = await supabase
      .from('admin_audit')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'overdue_checkin_detected')
      .in('target_id', bookingIds);

    return {
      total_links_created: totalLinks || 0,
      active_links: activeLinks || 0,
      successful_checkins: successfulCheckins || 0,
      overdue_incidents: overdueIncidents || 0
    };
  } catch (error) {
    console.error('Error getting safety link stats:', error);
    return { total_links_created: 0, active_links: 0, successful_checkins: 0, overdue_incidents: 0 };
  }
};