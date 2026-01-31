import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ServiceDetail from '../../features/listings/components/ServiceDetail';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const ServiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();
  const service = location.state?.service;

  if (!service) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600">Service not found.</p>
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-4 py-2 bg-trust-500 text-white rounded-lg hover:bg-trust-600 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <ServiceDetail
      service={service}
      onBack={() => navigate('/browse')}
      userType={userType}
      onSignUpAsClient={() => navigate('/signup')}
      onBook={() => {
        console.log('Booking service:', service);
      }}
    />
  );
};

export default ServiceDetailPage;
