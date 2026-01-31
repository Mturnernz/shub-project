import React from 'react';
import { useNavigate } from 'react-router-dom';
import HostProfileManagement from '../../features/profiles/components/HostProfileManagement';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ProfileManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  if (!userProfile) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <HostProfileManagement
      onBack={() => navigate('/dashboard')}
      userId={userProfile.id}
    />
  );
};

export default ProfileManagementPage;
