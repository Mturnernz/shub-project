import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LoginForm
      onBack={() => navigate('/')}
      onLoginSuccess={() => {
        // Auth state change listener in useAuthInit will handle the profile fetch
        // Navigate to browse/dashboard after successful login
        navigate('/browse');
      }}
    />
  );
};

export default LoginPage;
