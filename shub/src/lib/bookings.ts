import { supabase } from './supabase';
import type { Database } from './supabase';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export interface BookingWithProfiles extends Booking {
  worker_profile?: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    profile_photos?: string[];
  };
  client_profile?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface BookingRequest {
  worker_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  message?: string;
}

/**
 * Create a new booking request
 */
export const createBooking = async (
  bookingData: BookingRequest
): Promise<{ data: Booking | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        worker_id: bookingData.worker_id,
        client_id: bookingData.client_id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        status: 'pending'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<{ data: Booking | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get bookings for a specific user (worker or client)
 */
export const getBookingsByUser = async (
  userId: string,
  role: 'worker' | 'client'
): Promise<{ data: BookingWithProfiles[] | null; error: any }> => {
  try {
    console.log('getBookingsByUser called with:', { userId, role });
    const column = role === 'worker' ? 'worker_id' : 'client_id';

    // Fetch bookings with profile information for proper display
    // Use users table for both worker and client profiles since that's where the profile data is stored
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        worker_profile:users!worker_id(
          id,
          name,
          email,
          bio,
          avatar,
          profile_photos
        ),
        client_profile:users!client_id(
          id,
          name,
          email,
          avatar
        )
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });

    console.log('getBookingsByUser result:', { data, error, column, userId });
    return { data, error };
  } catch (error) {
    console.error('getBookingsByUser caught error:', error);
    return { data: null, error };
  }
};

/**
 * Get booking history with pagination
 */
export const getBookingHistory = async (
  userId: string,
  role: 'worker' | 'client',
  limit: number = 20,
  offset: number = 0
): Promise<{ data: BookingWithProfiles[] | null; error: any }> => {
  try {
    const column = role === 'worker' ? 'worker_id' : 'client_id';

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        worker_profile:users!worker_id(
          id,
          name,
          email,
          bio,
          avatar,
          profile_photos
        ),
        client_profile:users!client_id(
          id,
          name,
          email,
          avatar
        )
      `)
      .eq(column, userId)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get active bookings (pending, confirmed)
 */
export const getActiveBookings = async (
  userId: string,
  role: 'worker' | 'client'
): Promise<{ data: BookingWithProfiles[] | null; error: any }> => {
  try {
    const column = role === 'worker' ? 'worker_id' : 'client_id';

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        worker_profile:users!worker_id(
          id,
          name,
          email,
          bio,
          avatar,
          profile_photos
        ),
        client_profile:users!client_id(
          id,
          name,
          email,
          avatar
        )
      `)
      .eq(column, userId)
      .in('status', ['pending', 'confirmed'])
      .order('start_time', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check for booking conflicts
 */
export const checkBookingConflicts = async (
  workerId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBookings: Booking[] }> => {
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('worker_id', workerId)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking booking conflicts:', error);
      return { hasConflict: false, conflictingBookings: [] };
    }

    return {
      hasConflict: (data?.length || 0) > 0,
      conflictingBookings: data || []
    };
  } catch (error) {
    console.error('Error checking booking conflicts:', error);
    return { hasConflict: false, conflictingBookings: [] };
  }
};

/**
 * Get booking by ID with full details
 */
export const getBookingById = async (
  bookingId: string
): Promise<{ data: BookingWithProfiles | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        worker_profile:users!worker_id(
          id,
          name,
          email,
          bio,
          avatar,
          profile_photos
        ),
        client_profile:users!client_id(
          id,
          name,
          email,
          avatar
        )
      `)
      .eq('id', bookingId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // First verify user has permission to cancel this booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('worker_id, client_id, status')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.worker_id !== userId && booking.client_id !== userId) {
      return { success: false, error: 'Unauthorized to cancel this booking' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return { success: false, error: 'Cannot cancel this booking' };
    }

    const { error } = await updateBookingStatus(bookingId, 'cancelled');

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};