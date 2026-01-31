import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Calendar } from 'lucide-react';
import { useAuthStore } from '../features/auth/stores/auth.store';
import { useAuthInit } from '../features/auth/hooks/useAuthInit';
import { useMessagesStore } from '../features/messages/stores/messages.store';
import Header from '../components/layout/Header';

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, loading, currentRole, setCurrentRole, getEffectiveUserType, canToggleRoles } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnread);

  // Initialize auth listener
  useAuthInit();

  const userType = getEffectiveUserType();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const clientTabs = [
    { path: '/browse', icon: Home, label: 'Home' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const hostTabs = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const guestTabs = [
    { path: '/browse', icon: Home, label: 'Browse' },
  ];

  const tabs = userType === 'host' ? hostTabs : userType === 'client' ? clientTabs : guestTabs;

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/browse') return userType ? 'Browse' : 'Browse Services';
    if (path === '/bookings') return 'My Bookings';
    if (path === '/messages') return 'Messages';
    if (path === '/profile') return 'Profile';
    if (path.startsWith('/listings/')) return 'Service Details';
    if (path.startsWith('/bookings/') && path.endsWith('/chat')) return 'Chat';
    if (path.match(/^\/bookings\/[^/]+$/) && path !== '/bookings') return 'Booking Details';
    if (path === '/dashboard/profile') return 'Manage Profile';
    return 'Shub';
  };

  const getBackHandler = () => {
    const path = location.pathname;
    if (path.startsWith('/listings/')) return () => navigate('/browse');
    if (path.startsWith('/bookings/') && path.endsWith('/chat')) return () => navigate('/messages');
    if (path.match(/^\/bookings\/[^/]+$/) && path !== '/bookings') return () => navigate('/bookings');
    if (path === '/dashboard/profile') return () => navigate('/dashboard');
    if (path === '/browse' && !userType) return () => navigate('/');
    return undefined;
  };

  const handleRoleChange = async (newRole: 'host' | 'client') => {
    if (canToggleRoles()) {
      // Update role in database
      const { supabase } = await import('../lib/supabase');
      if (userProfile) {
        await supabase.from('users').update({ current_role: newRole }).eq('id', userProfile.id);
      }
      setCurrentRole(newRole);
      // Navigate to appropriate home
      navigate(newRole === 'host' ? '/dashboard' : '/browse');
    }
  };

  const backHandler = getBackHandler();

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50">
      <Header
        title={getTitle()}
        onBack={backHandler}
        showBackButton={!!backHandler}
        showRoleToggle={canToggleRoles()}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isRoleToggling={false}
        showLogout={!!userProfile}
        onLogout={async () => {
          const { supabase } = await import('../lib/supabase');
          await supabase.auth.signOut();
          useAuthStore.getState().clearAuth();
          navigate('/');
        }}
      />

      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-trust-100 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
            const showBadge = tab.path === '/messages' && totalUnread > 0;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-trust-500 bg-trust-50'
                    : 'text-gray-500 hover:text-trust-500 hover:bg-trust-50'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1" />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-warm-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
