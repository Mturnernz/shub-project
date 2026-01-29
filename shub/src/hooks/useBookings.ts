import { useState, useEffect, useCallback } from 'react';
import {
  createBooking,
  updateBookingStatus,
  getBookingsByUser,
  getActiveBookings,
  getBookingHistory,
  cancelBooking,
  checkBookingConflicts,
  type Booking,
  type BookingWithProfiles,
  type BookingRequest
} from '../lib/bookings';

interface UseBookingsReturn {
  bookings: BookingWithProfiles[];
  activeBookings: BookingWithProfiles[];
  loading: boolean;
  error: string | null;
  createNewBooking: (request: BookingRequest) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  updateStatus: (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => Promise<boolean>;
  cancelUserBooking: (bookingId: string) => Promise<boolean>;
  checkConflicts: (workerId: string, startTime: string, endTime: string) => Promise<boolean>;
  refreshBookings: () => Promise<void>;
  loadHistory: (limit?: number, offset?: number) => Promise<void>;
}

export const useBookings = (
  userId: string | null,
  userRole: 'worker' | 'client' | null
): UseBookingsReturn => {
  const [bookings, setBookings] = useState<BookingWithProfiles[]>([]);
  const [activeBookings, setActiveBookings] = useState<BookingWithProfiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBookings = useCallback(async () => {
    if (!userId || !userRole) {
      console.log('useBookings: Missing userId or userRole', { userId, userRole });
      return;
    }

    console.log('useBookings: Refreshing bookings for user', { userId, userRole });
    setLoading(true);
    setError(null);

    try {
      // Load all bookings
      console.log('useBookings: Fetching all bookings...');
      const { data: allBookings, error: allError } = await getBookingsByUser(userId, userRole);
      if (allError) throw allError;

      // Load active bookings
      console.log('useBookings: Fetching active bookings...');
      const { data: active, error: activeError } = await getActiveBookings(userId, userRole);
      if (activeError) throw activeError;

      console.log('useBookings: Setting bookings', {
        allBookings: allBookings?.length || 0,
        active: active?.length || 0
      });
      setBookings(allBookings || []);
      setActiveBookings(active || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error('useBookings: Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  const createNewBooking = useCallback(async (
    request: BookingRequest
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Check for conflicts first
      const { hasConflict } = await checkBookingConflicts(
        request.worker_id,
        request.start_time,
        request.end_time
      );

      if (hasConflict) {
        return {
          success: false,
          error: 'Time slot conflicts with existing booking'
        };
      }

      const { data, error } = await createBooking(request);

      if (error) {
        throw error;
      }

      if (data) {
        // Refresh bookings to include the new one
        await refreshBookings();
        return { success: true, booking: data };
      }

      return { success: false, error: 'Failed to create booking' };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [refreshBookings]);

  const updateStatus = useCallback(async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await updateBookingStatus(bookingId, status);

      if (error) {
        throw error;
      }

      if (data) {
        // Update local state
        setBookings(prev => prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status, updated_at: data.updated_at }
            : booking
        ));

        setActiveBookings(prev => {
          if (status === 'completed' || status === 'cancelled') {
            return prev.filter(booking => booking.id !== bookingId);
          }
          return prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status, updated_at: data.updated_at }
              : booking
          );
        });

        return true;
      }

      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
      console.error('Error updating booking status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelUserBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const { success, error: cancelError } = await cancelBooking(bookingId, userId);

      if (!success) {
        throw new Error(cancelError || 'Failed to cancel booking');
      }

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' as const, updated_at: new Date().toISOString() }
          : booking
      ));

      setActiveBookings(prev => prev.filter(booking => booking.id !== bookingId));

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      console.error('Error cancelling booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const checkConflicts = useCallback(async (
    workerId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      const { hasConflict } = await checkBookingConflicts(workerId, startTime, endTime);
      return hasConflict;
    } catch (err) {
      console.error('Error checking conflicts:', err);
      return false;
    }
  }, []);

  const loadHistory = useCallback(async (limit: number = 20, offset: number = 0) => {
    if (!userId || !userRole) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getBookingHistory(userId, userRole, limit, offset);

      if (error) {
        throw error;
      }

      if (offset === 0) {
        setBookings(data || []);
      } else {
        setBookings(prev => [...prev, ...(data || [])]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking history');
      console.error('Error loading booking history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  // Load initial data
  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  return {
    bookings,
    activeBookings,
    loading,
    error,
    createNewBooking,
    updateStatus,
    cancelUserBooking,
    checkConflicts,
    refreshBookings,
    loadHistory
  };
};