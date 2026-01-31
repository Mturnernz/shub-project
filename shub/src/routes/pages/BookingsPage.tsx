import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingList from '../../features/bookings/components/BookingList';
import { useBookings } from '../../features/bookings/hooks/useBookings';
import { useBookingRealtime } from '../../features/bookings/hooks/useBookingRealtime';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();
  const userRole = userType === 'host' ? 'worker' : 'client';

  const {
    bookings,
    loading: bookingsLoading,
    updateStatus,
    refreshBookings,
  } = useBookings(userProfile?.id || null, userProfile ? userRole : null);

  // Real-time booking updates — refresh list when bookings change
  useBookingRealtime(userProfile?.id || null, userProfile ? userRole : null, {
    onBookingCreated: useCallback(() => refreshBookings(), [refreshBookings]),
    onBookingUpdated: useCallback(() => refreshBookings(), [refreshBookings]),
    onBookingDeleted: useCallback(() => refreshBookings(), [refreshBookings]),
  });

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600">Please log in to view bookings.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <BookingList
        bookings={bookings}
        userRole={userRole}
        loading={bookingsLoading}
        title="Your Bookings"
        emptyMessage={userType === 'client' ? 'No bookings yet' : 'No booking requests yet'}
        onUpdateStatus={async (bookingId, status) => updateStatus(bookingId, status)}
        onViewDetails={(booking) => navigate(`/bookings/${booking.id}`)}
        onOpenChat={(booking) => navigate(`/bookings/${booking.id}/chat`, { state: { booking } })}
      />
    </div>
  );
};

export default BookingsPage;
