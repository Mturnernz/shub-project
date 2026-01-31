import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import MessageThread from '../../features/messages/components/MessageThread';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useMessagesStore } from '../../features/messages/stores/messages.store';
import { getBookingById } from '../../features/bookings/services/bookings';
import type { BookingWithProfiles } from '../../features/bookings/services/bookings';

const MessageThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: bookingId } = useParams<{ id: string }>();
  const { userProfile } = useAuthStore();
  const clearUnread = useMessagesStore((s) => s.clearUnreadForBooking);

  // Accept booking from either navigation source
  const passedBooking: BookingWithProfiles | undefined = location.state?.booking;
  const [booking, setBooking] = useState<BookingWithProfiles | null>(passedBooking || null);
  const [loading, setLoading] = useState(!passedBooking);
  const [error, setError] = useState<string | null>(null);

  // If no booking was passed in state, fetch it by ID from the URL
  useEffect(() => {
    if (passedBooking || !bookingId) return;

    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await getBookingById(bookingId);
      if (fetchError || !data) {
        setError('Booking not found');
      } else {
        setBooking(data);
      }
      setLoading(false);
    };

    load();
  }, [bookingId, passedBooking]);

  // Clear unread count when entering conversation
  useEffect(() => {
    if (bookingId) {
      clearUnread(bookingId);
    }
  }, [bookingId, clearUnread]);

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Please log in to view messages.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-gray-600">{error || 'Please select a booking to view messages.'}</p>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
          >
            View Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <MessageThread
        booking={booking}
        currentUserId={userProfile.id}
        onBack={() => navigate('/messages')}
      />
    </div>
  );
};

export default MessageThreadPage;
