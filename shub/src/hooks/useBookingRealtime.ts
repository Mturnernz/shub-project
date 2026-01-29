import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Booking } from '../lib/bookings';

interface BookingRealtimeCallbacks {
  onBookingCreated?: (booking: Booking) => void;
  onBookingUpdated?: (booking: Booking) => void;
  onBookingDeleted?: (bookingId: string) => void;
  onError?: (error: any) => void;
}

export const useBookingRealtime = (
  userId: string | null,
  userRole: 'worker' | 'client' | null,
  callbacks: BookingRealtimeCallbacks
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!userId || !userRole) {
      return;
    }

    // Create channel for booking updates
    const channel = supabase.channel(`bookings-${userId}`, {
      config: {
        broadcast: { self: true }
      }
    });

    // Listen for booking changes where user is involved
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: userRole === 'worker'
            ? `worker_id=eq.${userId}`
            : `client_id=eq.${userId}`
        },
        (payload) => {
          console.log('New booking created:', payload);
          if (callbacksRef.current.onBookingCreated) {
            callbacksRef.current.onBookingCreated(payload.new as Booking);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: userRole === 'worker'
            ? `worker_id=eq.${userId}`
            : `client_id=eq.${userId}`
        },
        (payload) => {
          console.log('Booking updated:', payload);
          if (callbacksRef.current.onBookingUpdated) {
            callbacksRef.current.onBookingUpdated(payload.new as Booking);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookings',
          filter: userRole === 'worker'
            ? `worker_id=eq.${userId}`
            : `client_id=eq.${userId}`
        },
        (payload) => {
          console.log('Booking deleted:', payload);
          if (callbacksRef.current.onBookingDeleted) {
            callbacksRef.current.onBookingDeleted(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to booking updates for user:', userId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to booking updates');
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError('Failed to subscribe to real-time updates');
          }
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from booking updates for user:', userId);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, userRole]);

  // Function to manually unsubscribe
  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return { unsubscribe };
};