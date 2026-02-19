import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Calendar, Shield, LayoutDashboard, Users, Flag, FileText } from 'lucide-react';
import { useAuthStore } from '../features/auth/stores/auth.store';
import { useMessagesStore } from '../features/messages/stores/messages.store';
import Header from '../components/layout/Header';
import PageTransition from '../components/layout/PageTransition';

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, loading, currentRole, setCurrentRole, getEffectiveUserType, canToggleRoles, isAuthenticated } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnread);

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
    { path: '/browse', icon: Search, label: 'Browse Listings' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const workerTabs = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/safety', icon: Shield, label: 'Safety' },
    { path: '/dashboard/profile', icon: User, label: 'My Profile' },
  ];

  const guestTabs = [
    { path: '/browse', icon: Search, label: 'Browse Listings' },
  ];

  const adminTabs = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/verifications', icon: Shield, label: 'Verify' },
    { path: '/admin/profiles', icon: Users, label: 'Profiles' },
    { path: '/admin/reports', icon: Flag, label: 'Reports' },
    { path: '/admin/audit-log', icon: FileText, label: 'Audit' },
  ];

  // If user is authenticated but profile hasn't loaded yet, show client tabs
  const tabs = userType === 'admin'
    ? adminTabs
    : userType === 'worker'
      ? workerTabs
      : userType === 'client'
        ? clientTabs
        : isAuthenticated
          ? clientTabs
          : guestTabs;

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
    if (path === '/safety') return 'Safety Hub';
    if (path === '/safety/notes') return 'Client Notes';
    if (path === '/verify') return 'Identity Verification';
    // Admin pages
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/verifications') return 'Verification Queue';
    if (path === '/admin/profiles') return 'Profile Publishing';
    if (path === '/admin/reports') return 'Moderation Queue';
    if (path === '/admin/audit-log') return 'Audit Log';
    return 'Shub';
  };

  const getBackHandler = () => {
    const path = location.pathname;
    if (path.startsWith('/listings/')) return () => navigate('/browse');
    if (path.startsWith('/bookings/') && path.endsWith('/chat')) return () => navigate('/messages');
    if (path.match(/^\/bookings\/[^/]+$/) && path !== '/bookings') return () => navigate('/bookings');
    if (path === '/dashboard/profile') {
      // No back button while the worker is setting up for the first time —
      // their profile is not published so /dashboard would redirect straight back here.
      // Once published, show a back button to the dashboard overview.
      return userProfile?.isPublished ? () => navigate('/dashboard') : undefined;
    }
    if (path === '/safety/notes') return () => navigate('/safety');
    if (path === '/verify') return () => navigate('/profile');
    if (path === '/browse' && !userType && !userProfile) return () => navigate('/');
    return undefined;
  };

  const handleRoleChange = async (newRole: 'worker' | 'client') => {
    if (canToggleRoles()) {
      // Update role in database
      const { supabase } = await import('../lib/supabase');
      if (userProfile) {
        await supabase.from('users').update({ current_role: newRole }).eq('id', userProfile.id);
      }
      setCurrentRole(newRole);
      // Navigate to appropriate home
      navigate(newRole === 'worker' ? '/dashboard' : '/browse');
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
        currentRole={currentRole as 'worker' | 'client'}
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
        <PageTransition locationKey={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-trust-100 px-2 sm:px-4 z-50 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            // Dashboard tab uses exact match so it doesn't stay active when navigating
            // to sub-paths like /dashboard/profile (which has its own "My Profile" tab).
            const isActive = tab.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
            const showBadge = tab.path === '/messages' && totalUnread > 0;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-trust-500 bg-trust-50'
                    : 'text-gray-500 hover:text-trust-500 hover:bg-trust-50 active:bg-trust-100'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-warm-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
