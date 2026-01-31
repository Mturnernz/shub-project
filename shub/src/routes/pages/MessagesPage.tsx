import React from 'react';
import { useNavigate } from 'react-router-dom';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
        <p className="text-gray-600 text-center">
          Messages are available for confirmed bookings. Select a booking to start chatting.
        </p>
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
          >
            View Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
