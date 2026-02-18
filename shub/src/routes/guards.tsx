import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '../stores/ui.store';
import AgeGate from '../features/auth/components/AgeGate';

export const AgeGateGuard: React.FC = () => {
  const { ageVerified, setAgeVerified } = useUIStore();

  if (!ageVerified) {
    return (
      <AgeGate
        onVerified={() => setAgeVerified(true)}
      />
    );
  }

  return <Outlet />;
};
