import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Message } from '../services/messages';

interface MessageRealtimeCallbacks {
  onMessageReceived?: (message: Message) => void;
  onMessageDeleted?: (messageId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Subscribe to real-time message updates for a specific booking.
 * Uses Supabase Realtime postgres_changes to get live message inserts/deletes.
 */
export const useMessageRealtime = (
  bookingId: string | null,
  currentUserId: string | null,
  callbacks: MessageRealtimeCallbacks
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!bookingId || !currentUserId) return;

    const channel = supabase.channel(`messages-${bookingId}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only notify for messages from the other user (own messages are added optimistically)
          if (newMessage.sender_id !== currentUserId) {
            callbacksRef.current.onMessageReceived?.(newMessage);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          callbacksRef.current.onMessageDeleted?.(payload.old.id);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          callbacksRef.current.onError?.('Failed to subscribe to message updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [bookingId, currentUserId]);

  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return { unsubscribe };
};
