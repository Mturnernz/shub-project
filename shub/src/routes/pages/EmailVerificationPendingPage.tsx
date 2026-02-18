import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailVerificationPending from '../../features/auth/components/EmailVerificationPending';

const EmailVerificationPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = '', userType = 'client' } = (location.state as { email?: string; userType?: 'worker' | 'client' }) || {};

  return (
    <EmailVerificationPending
      email={email}
      userType={userType as 'worker' | 'client'}
      onBack={() => navigate('/')}
    />
  );
};

export default EmailVerificationPendingPage;
