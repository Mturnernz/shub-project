import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientHome from '../../features/listings/components/ClientHome';
import { useServices } from '../../features/listings/hooks/useServices';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { services, loading, error, searchServices } = useServices();
  const { getEffectiveUserType, isAuthenticated } = useAuthStore();
  const userType = getEffectiveUserType();

  return (
    <ClientHome
      services={services}
      loading={loading}
      error={error}
      onServiceClick={(service) => navigate(`/listings/${service.id}`, { state: { service } })}
      onCategoryClick={(category) => searchServices('', category, 'All Locations')}
      onSearch={searchServices}
      userType={userType}
      isAuthenticated={isAuthenticated}
      onBack={!userType && !isAuthenticated ? () => navigate('/') : undefined}
      showBackButton={!userType && !isAuthenticated}
      onSignUpAsClient={() => navigate('/signup')}
      canBecomeHost={false}
    />
  );
};

export default BrowsePage;
