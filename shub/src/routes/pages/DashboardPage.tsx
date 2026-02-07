import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerDashboard from '../../features/profiles/components/WorkerDashboard';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();

  // Redirect non-workers to browse
  if (userType !== 'worker') {
    navigate('/browse', { replace: true });
    return null;
  }

  return (
    <WorkerDashboard
      userProfile={userProfile}
      onManageProfile={() => navigate('/dashboard/profile')}
    />
  );
};

export default DashboardPage;
