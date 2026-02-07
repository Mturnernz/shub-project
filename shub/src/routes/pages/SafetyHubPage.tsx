import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, FileText, Bell, ArrowLeft, Plus, Phone, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import UglyMugsFeed from '../../features/safety/components/UglyMugsFeed';
import UglyMugsAlert from '../../features/safety/components/UglyMugsAlert';

type SafetyView = 'hub' | 'report';

const SafetyHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getEffectiveUserType } = useAuthStore();
  const userType = getEffectiveUserType();
  const isWorker = userType === 'worker';
  const [view, setView] = useState<SafetyView>('hub');

  if (!userProfile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Please log in to access safety features.</p>
        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-trust-500 text-white rounded-lg">
          Log In
        </button>
      </div>
    );
  }

  if (view === 'report') {
    return (
      <div className="px-4 py-6">
        <UglyMugsAlert
          onComplete={() => setView('hub')}
          onCancel={() => setView('hub')}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Safety Hub</h1>
          <p className="text-sm text-gray-500">Your safety tools and community alerts</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-safe-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-safe-600" />
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-red-800 mb-2">Emergency Contacts</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:111"
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50"
          >
            <Phone className="w-4 h-4" />
            Police: 111
          </a>
          <a
            href="tel:0800762753"
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50"
          >
            <Phone className="w-4 h-4" />
            NZPC: 0800 762 753
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {isWorker && (
          <button
            onClick={() => setView('report')}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Report Bad Client</span>
          </button>
        )}

        <button
          onClick={() => navigate('/profile?tab=verification')}
          className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-trust-50 hover:border-trust-200 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-trust-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {userProfile.verified ? 'Verified' : 'Get Verified'}
          </span>
        </button>

        {isWorker && (
          <button
            onClick={() => navigate('/safety/notes')}
            className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Client Notes</span>
          </button>
        )}

        <a
          href="https://www.nzpc.org.nz/Know-Your-Rights"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-safe-50 hover:border-safe-200 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-safe-100 flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-safe-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Know Your Rights</span>
        </a>
      </div>

      {/* Ugly Mugs Feed */}
      {isWorker && (
        <UglyMugsFeed region={userProfile.primaryLocation || userProfile.location || 'Auckland'} />
      )}

      {/* Safety Tips */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Safety Tips</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Always use the Safe Buddy feature for bookings</p>
          <p>• Meet new clients in public places first if possible</p>
          <p>• Trust your instincts — decline if something feels wrong</p>
          <p>• Keep condoms available and non-negotiable</p>
          <p>• Have a safety plan and share it with a trusted friend</p>
          <p>• Report concerning behaviour to help the community</p>
        </div>
        <a
          href="https://www.nzpc.org.nz/Safety"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-trust-600 font-medium hover:text-trust-700"
        >
          <ExternalLink className="w-4 h-4" />
          More safety resources from NZPC
        </a>
      </div>
    </div>
  );
};

export default SafetyHubPage;
