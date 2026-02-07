import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTypeSelection from '../features/auth/components/UserTypeSelection';
import SignUpForm from '../features/auth/components/SignUpForm';

type UserType = 'worker' | 'client' | null;

const SignUpFlow: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  if (!selectedType) {
    return (
      <UserTypeSelection
        onSelect={(type) => setSelectedType(type)}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <SignUpForm
      userType={selectedType}
      onBack={() => setSelectedType(null)}
      onSignUpSuccess={(type, email) => {
        navigate('/verify-email', { state: { email, userType: type } });
      }}
    />
  );
};

export default SignUpFlow;
