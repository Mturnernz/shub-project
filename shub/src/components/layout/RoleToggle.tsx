import React from 'react';
import { User, Home } from 'lucide-react';

interface RoleToggleProps {
  currentRole: 'host' | 'client';
  onRoleChange: (role: 'host' | 'client') => void;
  disabled?: boolean;
}

const RoleToggle: React.FC<RoleToggleProps> = ({
  currentRole,
  onRoleChange,
  disabled = false
}) => {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex items-center space-x-1">
      <button
        onClick={() => onRoleChange('client')}
        disabled={disabled}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          currentRole === 'client'
            ? 'bg-white/90 text-trust-600 shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <User className="w-4 h-4" />
        <span>Client</span>
      </button>

      <button
        onClick={() => onRoleChange('host')}
        disabled={disabled}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          currentRole === 'host'
            ? 'bg-white/90 text-trust-600 shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Home className="w-4 h-4" />
        <span>Host</span>
      </button>
    </div>
  );
};

export default RoleToggle;