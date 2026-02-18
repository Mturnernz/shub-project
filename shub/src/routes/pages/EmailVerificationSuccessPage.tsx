import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailVerificationSuccessPage from '../../features/auth/components/EmailVerificationSuccessPage';

const EmailVerificationSuccessPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType = 'client' } = (location.state as { userType?: 'worker' | 'client' }) || {};

  const handleProceed = () => {
    if (userType === 'worker') {
      navigate('/dashboard');
    } else {
      navigate('/browse');
    }
  };

  return (
    <EmailVerificationSuccessPage
      userType={userType as 'worker' | 'client'}
      onProceed={handleProceed}
    />
  );
};

export default EmailVerificationSuccessPageRoute;
