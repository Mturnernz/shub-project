import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, Users, Calendar, CheckCircle, AlertCircle, Camera, FileText, MapPin, Globe, List, Shield, ExternalLink, ArrowRight } from 'lucide-react';
import { User } from '../../../types';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

const WELCOME_DISMISSED_KEY = 'shub_worker_welcome_dismissed';

interface WorkerDashboardProps {
  userProfile: User | null;
  onManageProfile: () => void;
}

// Getting started steps for new workers
const getOnboardingSteps = (completedFields: string[]) => {
  const isFieldComplete = (label: string) => completedFields.includes(label);
  return [
    { id: 'photos', label: 'Upload 3+ photos', icon: Camera, done: isFieldComplete('Profile Photos (min 3)') },
    { id: 'bio', label: 'Write your bio', icon: FileText, done: isFieldComplete('Bio') },
    { id: 'location', label: 'Set your location', icon: MapPin, done: isFieldComplete('Location') },
    { id: 'serviceAreas', label: 'Add service areas', icon: MapPin, done: isFieldComplete('Service Areas') },
    { id: 'languages', label: 'Add languages', icon: Globe, done: isFieldComplete('Languages') },
    { id: 'services', label: 'Add a service listing', icon: List, done: isFieldComplete('Name') }, // Name is always set early — proxy for "basic setup done"
  ];
};

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  userProfile,
  onManageProfile
}) => {
  const { percentage, missingFields, completedFields, isComplete } = useProfileCompletion(userProfile);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY);
    if (!dismissed && percentage < 50) {
      setShowWelcome(true);
    }
  }, [percentage]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  };

  const onboardingSteps = getOnboardingSteps(completedFields);
  const completedSteps = onboardingSteps.filter(s => s.done).length;

  const getCompletionColor = (pct: number) => {
    if (pct >= 80) return 'text-safe-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (pct: number) => {
    if (pct >= 80) return 'bg-safe-100 border-safe-200';
    if (pct >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="px-4 py-8 space-y-6">
      {/* Welcome Flow for New Workers */}
      {showWelcome && (
        <div className="bg-gradient-to-br from-trust-600 to-warm-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Shub!</h2>
          <p className="text-trust-100 mb-4">
            You're joining a safety-first platform built for NZ sex workers. Here's how to get started:
          </p>
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
              <p className="text-sm">Complete your profile with photos, bio, and location</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
              <p className="text-sm">Add your services and set availability</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
              <p className="text-sm">Publish your profile and start receiving bookings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onManageProfile}
              className="bg-white text-trust-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-trust-50 transition-colors text-sm"
            >
              Set Up My Profile
            </button>
            <button
              onClick={dismissWelcome}
              className="bg-white/20 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {/* Regular Welcome Section (when welcome flow is dismissed) */}
      {!showWelcome && (
        <div className="bg-gradient-to-r from-trust-500/20 to-warm-500/20 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.name || 'Worker'}!
          </h2>
          <p className="text-gray-600">
            Manage your services and grow your business
          </p>
        </div>
      )}

      {/* Getting Started Checklist */}
      {!isComplete && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <span className="text-sm text-gray-500">{completedSteps}/{onboardingSteps.length} complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-trust-500 to-safe-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / onboardingSteps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {onboardingSteps.map((step) => (
              <button
                key={step.id}
                onClick={onManageProfile}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  step.done
                    ? 'bg-safe-50 text-safe-700'
                    : 'bg-gray-50 hover:bg-trust-50 text-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? 'bg-safe-200' : 'bg-gray-200'
                }`}>
                  {step.done ? (
                    <CheckCircle className="w-5 h-5 text-safe-600" />
                  ) : (
                    <step.icon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className={`flex-1 text-sm font-medium ${step.done ? 'line-through' : ''}`}>
                  {step.label}
                </span>
                {!step.done && <ArrowRight className="w-4 h-4 text-gray-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

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

        <div className="flex items-center space-x-4">
          <button
            onClick={onManageProfile}
            className="bg-gradient-to-r from-trust-600 to-warm-600 text-white px-6 py-3 rounded-lg hover:from-trust-700 hover:to-warm-700 transition-all duration-200 font-semibold flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Manage Profile</span>
          </button>

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

      {/* NZPC Resources & Safety */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-safe-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resources & Support</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Know your rights and stay safe. These resources are from the NZ Prostitutes' Collective (NZPC) and other support services.
        </p>
        <div className="space-y-2">
          <a
            href="https://www.nzpc.org.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-safe-50 rounded-xl hover:bg-safe-100 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-safe-800">NZ Prostitutes' Collective</p>
              <p className="text-xs text-safe-600">Rights, health info, and peer support</p>
            </div>
            <ExternalLink className="w-4 h-4 text-safe-400 group-hover:text-safe-600" />
          </a>
          <a
            href="https://www.nzpc.org.nz/resources/know-your-rights"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-trust-50 rounded-xl hover:bg-trust-100 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-trust-800">Know Your Rights</p>
              <p className="text-xs text-trust-600">Prostitution Reform Act 2003 guide</p>
            </div>
            <ExternalLink className="w-4 h-4 text-trust-400 group-hover:text-trust-600" />
          </a>
          <a
            href="https://www.nzpc.org.nz/resources/safety"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-warm-50 rounded-xl hover:bg-orange-100 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">Safety Tips</p>
              <p className="text-xs text-gray-600">Practical safety advice for sex workers</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
