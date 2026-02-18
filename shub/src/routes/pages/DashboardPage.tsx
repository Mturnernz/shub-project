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

  // Redirect to profile setup when the profile hasn't been published yet.
  // Once published, the overview dashboard is the default landing.
  if (!userProfile?.isPublished) {
    navigate('/dashboard/profile', { replace: true });
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
