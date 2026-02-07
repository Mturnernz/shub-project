import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, MessageSquare, XCircle, CheckCircle, DollarSign, Shield } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { getBookingById, type BookingWithProfiles } from '../../features/bookings/services/bookings';
import { useBookings } from '../../features/bookings/hooks/useBookings';
import BookingStatus from '../../features/bookings/components/BookingStatus';
import ClientNotes from '../../features/safety/components/ClientNotes';
import SafetyCheckIn from '../../features/safety/components/SafetyCheckIn';

const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userProfile, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();
  const userRole = userType === 'worker' ? 'worker' : 'client';

  const { updateStatus, cancelUserBooking } = useBookings(
    userProfile?.id || null,
    userProfile ? userRole : null
  );

  const [booking, setBooking] = useState<BookingWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await getBookingById(id);
      if (fetchError || !data) {
        setError('Booking not found');
      } else {
        setBooking(data);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Please log in to view booking details.</p>
        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-trust-500 text-white rounded-lg">
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-64 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-56 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
        <button onClick={() => navigate('/bookings')} className="px-4 py-2 bg-trust-500 text-white rounded-lg">
          Back to Bookings
        </button>
      </div>
    );
  }

  const isWorker = booking.worker_id === userProfile.id;
  const otherName = isWorker
    ? booking.client_profile?.name || 'Client'
    : booking.worker_profile?.name || 'Provider';

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const durationHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) * 10) / 10;

  const handleConfirm = async () => {
    setActionLoading(true);
    const success = await updateStatus(booking.id, 'confirmed');
    if (success) setBooking({ ...booking, status: 'confirmed' });
    setActionLoading(false);
  };

  const handleDecline = async () => {
    setActionLoading(true);
    const success = await cancelUserBooking(booking.id);
    if (success) setBooking({ ...booking, status: 'cancelled' });
    setActionLoading(false);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    const success = await updateStatus(booking.id, 'completed');
    if (success) setBooking({ ...booking, status: 'completed' });
    setActionLoading(false);
  };

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Status Banner */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
          <BookingStatus status={booking.status} size="md" showText userRole={userRole} />
        </div>

        {/* Other User Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-trust-100 flex items-center justify-center">
            <User className="w-6 h-6 text-trust-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{otherName}</p>
            <p className="text-sm text-gray-500">{isWorker ? 'Client' : 'Provider'}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-trust-500" />
            <span>
              {startDate.toLocaleDateString('en-NZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-trust-500" />
            <span>
              {startDate.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true })}
              {' - '}
              {endDate.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true })}
              {' '}({durationHours}h)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Worker pending actions */}
          {isWorker && booking.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-safe-600 text-white rounded-xl font-semibold hover:bg-safe-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
            </div>
          )}

          {/* Client pending cancel */}
          {!isWorker && booking.status === 'pending' && (
            <button
              onClick={handleDecline}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Cancel Request
            </button>
          )}

          {/* Confirmed booking actions */}
          {booking.status === 'confirmed' && (
            <>
              <button
                onClick={() => navigate(`/bookings/${booking.id}/chat`, { state: { booking } })}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Message {otherName}
              </button>

              {isWorker && (
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-safe-100 text-safe-700 rounded-xl font-semibold hover:bg-safe-200 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </button>
              )}

              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Cancel Booking
              </button>
            </>
          )}

          {/* Completed — show message option */}
          {booking.status === 'completed' && (
            <button
              onClick={() => navigate(`/bookings/${booking.id}/chat`, { state: { booking } })}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-trust-100 text-trust-700 rounded-xl font-semibold hover:bg-trust-200 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              View Conversation
            </button>
          )}
        </div>
      </div>

      {/* Payment Coordination */}
      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <div className="bg-trust-50 border border-trust-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-trust-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-trust-800 font-medium">Payment arranged directly</p>
              <p className="text-sm text-trust-700 mt-1">
                {booking.status === 'confirmed'
                  ? `Use the messaging feature to arrange payment directly with ${otherName}. Shub does not process or hold payments.`
                  : 'Once confirmed, you can arrange payment details through messaging. Shub does not process payments.'}
              </p>
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => navigate(`/bookings/${booking.id}/chat`, { state: { booking } })}
                  className="mt-2 text-sm text-trust-600 font-medium hover:text-trust-700 underline"
                >
                  Discuss payment in chat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Reminder */}
      {booking.status === 'confirmed' && (
        <div className="bg-safe-50 border border-safe-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-safe-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-safe-800 font-medium">Safety Reminder</p>
              <p className="text-sm text-safe-700 mt-1">
                Always meet in a safe location. Use the Safe Buddy feature to share your booking details with a trusted contact.
              </p>
              <button
                onClick={() => navigate('/safety')}
                className="mt-2 text-sm text-safe-600 font-medium hover:text-safe-700 underline"
              >
                Open Safety Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Check-in Timer — for confirmed bookings */}
      {booking.status === 'confirmed' && (
        <SafetyCheckIn
          token={booking.id}
          scheduledTime={booking.start_time}
          durationHours={durationHours}
          workerName={isWorker ? undefined : booking.worker_profile?.name}
        />
      )}

      {/* Provider Client Notes — only visible to host after booking */}
      {isWorker && (booking.status === 'confirmed' || booking.status === 'completed') && (
        <ClientNotes
          clientId={booking.client_id}
          clientName={booking.client_profile?.name || 'Client'}
          bookingId={booking.id}
          compact={booking.status === 'confirmed'}
        />
      )}
    </div>
  );
};

export default BookingDetailPage;
