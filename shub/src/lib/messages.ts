import { supabase } from './supabase';
import type { Database } from './supabase';
import { moderateContent, logModerationAction } from './contentModeration';

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
    // First get all bookings for the user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, start_time, worker_id, client_id')
      .or(`worker_id.eq.${userId},client_id.eq.${userId}`)
      .in('status', ['confirmed', 'completed'])
      .order('created_at', { ascending: false });

    if (bookingsError) {
      return { data: null, error: bookingsError };
    }

    if (!bookings || bookings.length === 0) {
      return { data: [], error: null };
    }

    // Get latest message for each booking
    const conversations: Conversation[] = [];

    for (const booking of bookings) {
      // Get latest message
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

      // Count unread messages (simplified - could be enhanced with read receipts)
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', booking.id)
        .neq('sender_id', userId);

      conversations.push({
        booking_id: booking.id,
        last_message: latestMessage || undefined,
        unread_count: unreadCount || 0,
        booking
      });
    }

    // Sort by last message time or booking time
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
 * Mark messages as read (placeholder for read receipts)
 */
export const markMessagesAsRead = async (
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // This is a placeholder implementation
    // In a full implementation, you might have a separate read_receipts table
    // or add a read_at field to messages

    console.log(`Marking messages as read for booking ${bookingId} by user ${userId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error };
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