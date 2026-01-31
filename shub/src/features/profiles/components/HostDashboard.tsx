import React from 'react';
import { Settings, BarChart3, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../../../types';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

interface HostDashboardProps {
  userProfile: User | null;
  onManageProfile: () => void;
}

const HostDashboard: React.FC<HostDashboardProps> = ({
  userProfile,
  onManageProfile
}) => {
  const { percentage, missingFields, isComplete } = useProfileCompletion(userProfile);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-safe-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-safe-100 border-safe-200';
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="px-4 py-8 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-trust-500/20 to-warm-500/20 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userProfile?.name || 'Host'}!
        </h2>
        <p className="text-gray-600">
          Manage your services and grow your hosting business
        </p>
      </div>

      {/* Profile Management Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Profile Management</h3>
          {isComplete ? (
            <CheckCircle className="w-6 h-6 text-safe-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <button
                onClick={onManageProfile}
                className="bg-gradient-to-r from-trust-600 to-warm-600 text-white px-6 py-3 rounded-lg hover:from-trust-700 hover:to-warm-700 transition-all duration-200 font-semibold flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Profile</span>
              </button>

              {/* Profile Completion Indicator */}
              <div className={`px-4 py-2 rounded-lg border ${getCompletionBgColor(percentage)}`}>
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${percentage}, 100`}
                        className={getCompletionColor(percentage)}
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-200"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-bold ${getCompletionColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${getCompletionColor(percentage)}`}>
                      {percentage}% Complete
                    </p>
                    {!isComplete && (
                      <p className="text-xs text-gray-600">
                        {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} missing
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Fields */}
            {!isComplete && missingFields.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Complete your profile to attract more clients:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {missingFields.slice(0, 3).map((field, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      <span>{field}</span>
                    </li>
                  ))}
                  {missingFields.length > 3 && (
                    <li className="text-yellow-600">
                      +{missingFields.length - 3} more fields...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Quick Stats</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-trust-50 to-trust-100 rounded-xl">
            <div className="text-2xl font-bold text-trust-600 mb-1">0</div>
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Active Bookings</span>
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-safe-50 to-safe-100 rounded-xl">
            <div className="text-2xl font-bold text-safe-600 mb-1">0</div>
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Total Clients</span>
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-trust-50 to-trust-100 rounded-xl">
            <div className="text-2xl font-bold text-trust-600 mb-1">
              {userProfile?.verified ? 'Verified' : 'Pending'}
            </div>
            <div className="text-sm text-gray-600">Profile Status</div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {!isComplete && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 Boost Your Profile
          </h3>
          <p className="text-gray-600 mb-4">
            Complete your profile to increase visibility and attract more clients
          </p>
          <button
            onClick={onManageProfile}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold text-sm"
          >
            Complete Now
          </button>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;