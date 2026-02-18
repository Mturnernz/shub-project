import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LoginForm
      onBack={() => navigate('/')}
      onLoginSuccess={() => {
        // Auth state change listener in useAuthInit will handle the profile fetch.
        // DashboardPage will route workers to profile setup or overview based on
        // publish status, and redirect non-workers to /browse.
        navigate('/dashboard');
      }}
    />
  );
};

export default LoginPage;
