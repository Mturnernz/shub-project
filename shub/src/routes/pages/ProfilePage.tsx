import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  return (
    <div className="px-4 py-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile</h2>
        {userProfile ? (
          <div>
            <p className="text-gray-600 mb-4">
              {userProfile.name} ({userProfile.email})
            </p>
            <p className="text-gray-500">Profile settings coming soon</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
