import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/supabase';
import { moderateContent, logModerationAction } from '../../safety/services/content-moderation';

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface MessageWithSender extends Message {
  sender?: {
    display_name: string;
  };
}

export interface Conversation {
  booking_id: string;
  last_message?: MessageWithSender;
  unread_count: number;
  other_user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  booking?: {
    id: string;
    status: string;
    start_time: string;
    worker_id: string;
    client_id: string;
  };
}

/**
 * Unsafe phrases that should be filtered from messages
 */
const UNSAFE_PHRASES = [
  'no condom',
  'without condom',
  'bareback',
  'bb',
  'raw',
  'unprotected',
  'bare',
  'no rubber',
  'skin to skin',
  'natural',
  'unsafe'
];

/**
 * Filter content for safety violations
 */
export const filterMessageContent = (content: string): {
  safe: boolean;
  filtered_content: string;
  violations: string[];
} => {
  const violations: string[] = [];
  let filteredContent = content;

  // Check for unsafe phrases (case insensitive)
  UNSAFE_PHRASES.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
    if (regex.test(content)) {
      violations.push(phrase);
      filteredContent = filteredContent.replace(regex, '[FILTERED]');
    }
  });

  return {
    safe: violations.length === 0,
    filtered_content: filteredContent,
    violations
  };
};

/**
 * Send a message (with enhanced content moderation)
 */
export const sendMessage = async (
  bookingId: string,
  senderId: string,
  content: string
): Promise<{ data: Message | null; error: any; filtered?: boolean; blocked?: boolean }> => {
  try {
    // Enhanced content moderation
    const moderationResult = moderateContent(content, 'message');

    // Block messages with critical violations
    if (moderationResult.auto_block) {
      // Log the blocked attempt
      await logModerationAction('message', 'blocked_attempt', moderationResult, senderId);

      return {
        data: null,
        error: 'Message blocked due to safety violations',
        filtered: true,
        blocked: true
      };
    }

    // Use filtered content for storage
    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: senderId,
        content: moderationResult.filtered_content
      })
      .select()
      .single();

    if (error) throw error;

    // Log moderation result
    if (!moderationResult.safe || moderationResult.requires_review) {
      await logModerationAction('message', data.id, moderationResult, senderId);
    }

    return {
      data,
      error: null,
      filtered: !moderationResult.safe,
      blocked: false
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get messages for a booking
 */
export const getMessagesByBooking = async (
  bookingId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: MessageWithSender[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(
          display_name
        )
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get conversations for a user
 */
export const getUserConversations = async (
  userId: string
): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    // Get all bookings the user is part of (include pending so both parties can message)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, start_time, worker_id, client_id')
      .or(`worker_id.eq.${userId},client_id.eq.${userId}`)
      .in('status', ['pending', 'confirmed', 'completed'])
      .order('created_at', { ascending: false });

    if (bookingsError) {
      return { data: null, error: bookingsError };
    }

    if (!bookings || bookings.length === 0) {
      return { data: [], error: null };
    }

    // Collect other-user IDs to batch-fetch profiles
    const otherUserIds = bookings.map((b) =>
      b.worker_id === userId ? b.client_id : b.worker_id
    );
    const uniqueIds = [...new Set(otherUserIds)];

    // Fetch other users' display names in one query
    const { data: profiles } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', uniqueIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    // Build conversations with latest message + unread count
    const conversations: Conversation[] = [];

    for (const booking of bookings) {
      const { data: latestMessage } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            display_name
          )
        `)
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const unreadCount = await getUnreadCount(booking.id, userId);

      const otherUserId = booking.worker_id === userId ? booking.client_id : booking.worker_id;
      const otherProfile = profileMap.get(otherUserId);

      conversations.push({
        booking_id: booking.id,
        last_message: latestMessage || undefined,
        unread_count: unreadCount || 0,
        other_user: otherProfile
          ? { id: otherProfile.id, display_name: otherProfile.display_name, avatar_url: otherProfile.avatar_url }
          : undefined,
        booking,
      });
    }

    // Sort by last message time (most recent first), fall back to booking time
    conversations.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.booking?.start_time || '';
      const bTime = b.last_message?.created_at || b.booking?.start_time || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return { data: conversations, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Mark messages as read by storing the current timestamp in the booking's
 * metadata JSONB field. The key is `last_read_<userId>`.
 */
export const markMessagesAsRead = async (
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Fetch current metadata
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('metadata')
      .eq('id', bookingId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr };

    const metadata = (booking?.metadata as Record<string, any>) || {};
    metadata[`last_read_${userId}`] = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ metadata })
      .eq('id', bookingId);

    if (updateErr) return { success: false, error: updateErr };

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Get the count of messages sent after the user's last-read timestamp.
 */
export const getUnreadCount = async (
  bookingId: string,
  userId: string
): Promise<number> => {
  try {
    // Get the last-read timestamp from booking metadata
    const { data: booking } = await supabase
      .from('bookings')
      .select('metadata')
      .eq('id', bookingId)
      .single();

    const metadata = (booking?.metadata as Record<string, any>) || {};
    const lastRead = metadata[`last_read_${userId}`];

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', userId);

    if (lastRead) {
      query = query.gt('created_at', lastRead);
    }

    const { count } = await query;
    return count || 0;
  } catch {
    return 0;
  }
};

/**
 * Delete a message (soft delete or admin only)
 */
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Verify user owns the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return { success: false, error: 'Message not found' };
    }

    if (message.sender_id !== userId) {
      return { success: false, error: 'Unauthorized to delete this message' };
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};