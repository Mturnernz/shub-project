import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, UserCheck, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

const WelcomePage: React.FC = () => {
  const { loading, isAuthenticated, userProfile } = useAuthStore();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  // Safety net: if auth doesn't resolve within 7s, show fallback
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  const handleWorkerProceed = () => navigate('/dashboard/profile', { replace: true });
  const handleClientProceed = () => navigate('/browse', { replace: true });
  const handleFallbackLogin = () => navigate('/login', { replace: true });

  // Loading state while Supabase processes the auth token from the email
  // verification link. The token is processed asynchronously AFTER the
  // initial auth check has already completed (loading=false), so we must
  // also wait when isAuthenticated is still false — otherwise the page
  // immediately falls through to the generic fallback before the SIGNED_IN
  // event fires and the profile is created.
  if ((loading || !isAuthenticated || (isAuthenticated && !userProfile)) && !timedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying your account…</h2>
          <p className="text-trust-100">Just a moment while we get everything ready.</p>
        </div>
      </div>
    );
  }

  // Worker welcome
  if (isAuthenticated && userProfile?.role === 'worker') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You're verified!</h1>
            <p className="text-trust-100 text-lg">Welcome to Shub, {userProfile.name || 'there'}.</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-trust-500 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Set up your host profile</h2>
                <p className="text-sm text-gray-500">You're a few steps away from going live</p>
              </div>
            </div>

            <ol className="space-y-3 mb-6">
              {[
                'Add your bio, photos, and services',
                'Set your availability and service areas',
                'Submit for admin verification',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-trust-100 text-trust-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={handleWorkerProceed}
              className="w-full bg-gradient-to-r from-trust-600 to-rose-600 text-white py-4 rounded-xl font-semibold hover:from-trust-700 hover:to-rose-700 transition-all duration-200 flex items-center justify-center"
            >
              Start setting up my profile
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-trust-100 text-sm text-center">
              Your profile won't be visible to clients until it's been reviewed and approved by our team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Client welcome
  if (isAuthenticated && userProfile?.role === 'client') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You're in!</h1>
            <p className="text-trust-100 text-lg">Welcome to Shub, {userProfile.name || 'there'}.</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trust-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Find a host near you</h2>
                <p className="text-sm text-gray-500">Browse verified, safety-checked profiles</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                'Filter by location, services, and availability',
                'Read profiles and reviews before booking',
                'Message hosts directly through the platform',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-safe-500 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>

            <button
              onClick={handleClientProceed}
              className="w-full bg-gradient-to-r from-trust-600 to-rose-600 text-white py-4 rounded-xl font-semibold hover:from-trust-700 hover:to-rose-700 transition-all duration-200 flex items-center justify-center"
            >
              Browse hosts
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: auth timed out or profile unavailable — never show an error, just prompt action
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Account verified!</h1>
        <p className="text-trust-100 text-lg mb-8">
          Your email is confirmed. Log in to complete your profile and get started.
        </p>
        <button
          onClick={handleFallbackLogin}
          className="w-full bg-white text-trust-700 py-4 rounded-xl font-semibold hover:bg-trust-50 transition-all duration-200 flex items-center justify-center"
        >
          Log in to continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
