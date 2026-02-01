import React from 'react';
import { useNavigate } from 'react-router-dom';
import IdentityVerification from '../../features/verification/components/IdentityVerification';

const VerificationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <IdentityVerification
        onComplete={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default VerificationPage;
