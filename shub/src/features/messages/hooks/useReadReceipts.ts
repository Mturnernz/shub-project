import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

/**
 * Marks all unread messages in a booking conversation as read
 * when the recipient opens the chat. Requires a `read_at` column on messages.
 */
export function useMarkMessagesRead(bookingId: string | null, currentUserId: string | null) {
  useEffect(() => {
    if (!bookingId || !currentUserId) return;

    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('booking_id', bookingId)
      .neq('sender_id', currentUserId)
      .is('read_at', null)
      .then(() => {
        // Silently mark as read — no UI action needed
      });
  }, [bookingId, currentUserId]);
}
