import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useSavedWorkers } from '../../features/listings/hooks/useSavedWorkers';
import ClientVerificationCard from '../../features/auth/components/ClientVerificationCard';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();
  const { savedIds } = useSavedWorkers();
  const [clientVerified, setClientVerified] = useState(false);

  // Workers manage their profile at /dashboard/profile — redirect them there.
  useEffect(() => {
    if (userType === 'worker') {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [userType, navigate]);

  // Don't render while redirecting workers
  if (userType === 'worker') return null;

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

      {/* Client Verification */}
      {isAuthenticated && userType === 'client' && userProfile && (
        <ClientVerificationCard
          userId={userProfile.id}
          isVerified={clientVerified || !!userProfile.verified}
          onVerified={() => setClientVerified(true)}
        />
      )}

      {/* Saved Workers */}
      {isAuthenticated && savedIds.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              Saved Workers
            </h3>
            <button
              onClick={() => navigate('/browse')}
              className="flex items-center gap-1 text-sm text-trust-600 hover:text-trust-700 font-medium"
            >
              Browse
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            You have <strong>{savedIds.length}</strong> saved worker{savedIds.length !== 1 ? 's' : ''}.
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-3 w-full py-2.5 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors"
          >
            View saved workers in Browse
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
