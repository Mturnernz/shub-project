import React from 'react';
import { useNavigate } from 'react-router-dom';
import HostDashboard from '../../features/profiles/components/HostDashboard';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();

  // Redirect non-hosts to browse
  if (userType !== 'host') {
    navigate('/browse', { replace: true });
    return null;
  }

  return (
    <HostDashboard
      userProfile={userProfile}
      onManageProfile={() => navigate('/dashboard/profile')}
    />
  );
};

export default DashboardPage;
