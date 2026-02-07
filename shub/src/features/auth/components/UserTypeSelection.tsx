import React from 'react';
import { UserCheck, Users, ArrowLeft } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelect: (role: 'worker' | 'client') => void;
  onBack: () => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-600 to-warm-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shub</h1>
          <p className="text-trust-100">
            Choose your account type
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelect('client')}
            className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-trust-500 to-warm-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">I'm a Client</h3>
                <p className="text-gray-600">
                  I want to browse and book services
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('worker')}
            className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-500 to-trust-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">I'm a Worker</h3>
                <p className="text-gray-600">
                  I want to offer my services
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-trust-100 text-sm">
            Select your account type to create an account
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
