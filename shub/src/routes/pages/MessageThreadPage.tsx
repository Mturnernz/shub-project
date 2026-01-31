import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MessageThread from '../../features/messages/components/MessageThread';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const MessageThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuthStore();
  const booking = location.state?.booking;

  if (!booking || !userProfile) {
    return (
      <div className="px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-gray-600">Please select a booking to view messages.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
          >
            View Bookings
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
        onBack={() => navigate('/bookings')}
      />
    </div>
  );
};

export default MessageThreadPage;
