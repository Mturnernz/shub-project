import React from 'react';
import { Bell, Settings, ArrowLeft, LogOut } from 'lucide-react';
import RoleToggle from './RoleToggle';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  showRoleToggle?: boolean;
  currentRole?: 'host' | 'client';
  onRoleChange?: (role: 'host' | 'client') => void;
  isRoleToggling?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showNotifications = true,
  showSettings = false,
  onBack,
  showBackButton = false,
  showRoleToggle = false,
  currentRole = 'client',
  onRoleChange,
  isRoleToggling = false,
  showLogout = false,
  onLogout
}) => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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

        <div className="flex items-center space-x-3">
          {showNotifications && (
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          )}
          {showSettings && (
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          )}
          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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