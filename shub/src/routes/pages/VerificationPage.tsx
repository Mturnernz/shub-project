import React from 'react';
import { useNavigate } from 'react-router-dom';
import IdentityVerification from '../../features/verification/components/IdentityVerification';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const VerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { getEffectiveUserType } = useAuthStore();

  const handleComplete = () => {
    const userType = getEffectiveUserType();
    if (userType === 'worker') {
      navigate('/dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="px-4 py-6">
      <IdentityVerification
        onComplete={handleComplete}
      />
    </div>
  );
};

export default VerificationPage;
