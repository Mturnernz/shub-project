import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerProfileManagement from '../../features/profiles/components/WorkerProfileManagement';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ProfileManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  if (!userProfile) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <WorkerProfileManagement
      onBack={() => navigate('/dashboard')}
      userId={userProfile.id}
    />
  );
};

export default ProfileManagementPage;
