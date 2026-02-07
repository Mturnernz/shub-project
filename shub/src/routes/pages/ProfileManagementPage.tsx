import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerProfileManagement from '../../features/profiles/components/WorkerProfileManagement';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ProfileManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, isAuthenticated } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-500"></div>
      </div>
    );
  }

  if (!userProfile && !isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <WorkerProfileManagement
      onBack={() => navigate('/dashboard')}
      userId={userProfile.id}
    />
  );
};

export default ProfileManagementPage;
