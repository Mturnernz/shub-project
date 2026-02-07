import React, { useState } from 'react';
import { Bell, ArrowLeft, LogOut } from 'lucide-react';
import RoleToggle from './RoleToggle';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  showRoleToggle?: boolean;
  currentRole?: 'worker' | 'client';
  onRoleChange?: (role: 'worker' | 'client') => void;
  isRoleToggling?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showNotifications = true,
  onBack,
  showBackButton = false,
  showRoleToggle = false,
  currentRole = 'client',
  onRoleChange,
  isRoleToggling = false,
  showLogout = false,
  onLogout
}) => {
  const [showNotifToast, setShowNotifToast] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifToast(true);
    setTimeout(() => setShowNotifToast(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-trust-600 to-warm-600 text-white px-4 py-4 sm:py-6 rounded-b-3xl shadow-lg">
      <div className="relative flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors mr-2 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{title}</h1>
          </div>
        </div>

        {/* Center Role Toggle */}
        {showRoleToggle && onRoleChange && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <RoleToggle
              currentRole={currentRole}
              onRoleChange={onRoleChange}
              disabled={isRoleToggling}
            />
          </div>
        )}

        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          {showNotifications && (
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              {showNotifToast && (
                <div className="absolute right-0 top-full mt-2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                  Notifications coming soon
                </div>
              )}
            </div>
          )}
          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
