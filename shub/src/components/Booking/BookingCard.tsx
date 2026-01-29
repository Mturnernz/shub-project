import React, { useState } from 'react';
import { Calendar, Clock, User, MessageCircle, Shield, Flag } from 'lucide-react';
import BookingStatus from './BookingStatus';
import type { BookingWithProfiles } from '../../lib/bookings';
import SafeBuddyGenerator from '../Safety/SafeBuddyGenerator';
import ReportModal from '../Reporting/ReportModal';

interface BookingCardProps {
  booking: BookingWithProfiles;
  userRole: 'worker' | 'client';
  onViewDetails?: (booking: BookingWithProfiles) => void;
  onUpdateStatus?: (bookingId: string, status: 'confirmed' | 'cancelled') => void;
  onOpenChat?: (booking: BookingWithProfiles) => void;
  showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  userRole,
  onViewDetails,
  onUpdateStatus,
  onOpenChat,
  showActions = true
}) => {
  const [showSafeBuddy, setShowSafeBuddy] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-NZ', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const startDateTime = formatDateTime(booking.start_time);
  const endDateTime = formatDateTime(booking.end_time);

  const getDisplayName = () => {
    if (userRole === 'worker') {
      return booking.client_profile?.name || 'Client';
    } else {
      return booking.worker_profile?.name || 'Worker';
    }
  };

  const getProfilePhoto = () => {
    if (userRole === 'client' && booking.worker_profile?.profile_photos?.length) {
      return booking.worker_profile.profile_photos[0];
    } else if (userRole === 'client' && booking.worker_profile?.avatar) {
      return booking.worker_profile.avatar;
    }
    return null;
  };

  const canConfirm = userRole === 'worker' && booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canMessage = booking.status === 'confirmed';

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getProfilePhoto() ? (
            <img
              src={getProfilePhoto()!}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{getDisplayName()}</h3>
            <p className="text-sm text-gray-600">
              {userRole === 'worker' ? 'Booking Request' : 'Your Booking'}
            </p>
          </div>
        </div>
        <BookingStatus status={booking.status} userRole={userRole} />
      </div>

      {/* Date and Time */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{startDateTime.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {startDateTime.time} - {endDateTime.time}
          </span>
        </div>
      </div>

      {/* Worker Bio (for client view) */}
      {userRole === 'client' && booking.worker_profile?.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {booking.worker_profile.bio}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {/* Confirm/Cancel for pending bookings */}
          {canConfirm && onUpdateStatus && (
            <>
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Decline
              </button>
            </>
          )}

          {/* Cancel button for confirmed bookings */}
          {canCancel && !canConfirm && onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'cancelled')}
              className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Message button for confirmed bookings */}
          {canMessage && onOpenChat && (
            <button
              onClick={() => onOpenChat(booking)}
              className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          )}

          {/* Safe Buddy link for workers with confirmed bookings */}
          {userRole === 'worker' && booking.status === 'confirmed' && (
            <button
              onClick={() => setShowSafeBuddy(true)}
              className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Safety Link
            </button>
          )}

          {/* Report button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Report user"
          >
            <Flag className="w-4 h-4" />
          </button>

          {/* View details button */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(booking)}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Details
            </button>
          )}
        </div>
      )}

      {/* Safe Buddy Generator Modal */}
      {showSafeBuddy && (
        <SafeBuddyGenerator
          booking={booking}
          onClose={() => setShowSafeBuddy(false)}
          onLinkGenerated={(link) => {
            console.log('Safety link generated:', link);
            setShowSafeBuddy(false);
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="user"
          targetId={userRole === 'worker' ? booking.client_id : booking.worker_id}
          targetName={userRole === 'worker' ? booking.client_profile?.name : booking.worker_profile?.name}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={() => {
            setShowReportModal(false);
            // Could show success message
          }}
          reporterId={userRole === 'worker' ? booking.worker_id : booking.client_id}
        />
      )}
    </div>
  );
};

export default BookingCard;