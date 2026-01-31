import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '../stores/ui.store';
import AgeGate from '../features/auth/components/AgeGate';

export const AgeGateGuard: React.FC = () => {
  const { ageVerified, setAgeVerified } = useUIStore();

  // Also check sessionStorage for session-level verification
  const sessionVerified = sessionStorage.getItem('shub_session_verified') === 'true';

  if (!ageVerified || !sessionVerified) {
    return (
      <AgeGate
        onVerified={() => {
          setAgeVerified(true);
          sessionStorage.setItem('shub_session_verified', 'true');
        }}
      />
    );
  }

  return <Outlet />;
};
