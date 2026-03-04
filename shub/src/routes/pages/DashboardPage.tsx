import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerDashboard from '../../features/profiles/components/WorkerDashboard';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getEffectiveUserType, isAuthenticated } = useAuthStore();
  const userType = getEffectiveUserType();

  // The 4-second safety timeout in useAuthInit can fire before fetchUserProfile
  // completes for new users (who need 2 DB inserts). Guard against premature
  // redirect by waiting if the user is authenticated but the profile hasn't
  // arrived yet — it will trigger a re-render once setUserProfile is called.
  if (isAuthenticated && !userProfile) {
    return null;
  }

  // Unauthenticated users should be prompted to log in, not silently sent
  // to browse. This also handles the brief post-login window before the
  // Supabase auth state change has been processed by the store.
  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  // Workers in "client mode" via the role toggle are browsing as clients —
  // redirect them to browse. Non-workers (actual clients) go to browse too.
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
