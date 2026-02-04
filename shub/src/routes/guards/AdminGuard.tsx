import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Checking permissions...</p>
    </div>
  </div>
);

export const AdminGuard: React.FC = () => {
  const { userProfile, loading, isAdmin } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/browse" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
