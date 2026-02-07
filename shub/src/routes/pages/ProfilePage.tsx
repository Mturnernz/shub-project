import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, MapPin } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated } = useAuthStore();

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
        {userProfile ? (
          <div className="space-y-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-trust-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-trust-100 flex items-center justify-center border-2 border-trust-200 flex-shrink-0">
                  <User className="w-10 h-10 text-trust-400" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{userProfile.name}</h2>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-trust-100 text-trust-700 capitalize">
                  {userProfile.role}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{userProfile.email}</span>
              </div>
              {userProfile.location && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{userProfile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={userProfile.verified ? 'text-safe-600' : 'text-orange-600'}>
                  {userProfile.verified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            </div>

            {userProfile.bio && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-700">{userProfile.bio}</p>
              </div>
            )}

            <p className="text-sm text-gray-400 text-center pt-2">
              More profile settings coming soon
            </p>
          </div>
        ) : isAuthenticated ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-trust-400" />
            </div>
            <p className="text-gray-600 mb-2">Setting up your profile...</p>
            <p className="text-sm text-gray-400">Your profile is being created. Try refreshing if this persists.</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-trust-500 text-white rounded-lg hover:bg-trust-600 active:bg-trust-700 transition-colors min-h-[44px]"
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
