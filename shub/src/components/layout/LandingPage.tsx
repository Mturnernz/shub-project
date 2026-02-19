import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus, LogIn, Shield, Star } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';

interface LandingPageProps {
  onBrowseAsGuest?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignUpSelection?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onBrowseAsGuest,
  onNavigateToLogin,
  onNavigateToSignUpSelection,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, getEffectiveUserType } = useAuthStore();

  if (!loading && isAuthenticated) {
    const userType = getEffectiveUserType();
    navigate(userType === 'worker' ? '/dashboard' : '/browse', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-600 to-warm-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const handleBrowseAsGuest = onBrowseAsGuest || (() => navigate('/browse'));
  const handleNavigateToLogin = onNavigateToLogin || (() => navigate('/login'));
  const handleNavigateToSignUp = onNavigateToSignUpSelection || (() => navigate('/signup'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-700 via-trust-600 to-warm-600 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Wordmark */}
        <div className="mb-2">
          <span className="text-white/60 text-sm font-medium tracking-widest uppercase">New Zealand</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-white text-center leading-tight mb-4">
          Shub
        </h1>
        <p className="font-display text-xl text-white/90 text-center leading-snug mb-2 italic">
          Service with confidence.
        </p>
        <p className="text-trust-100 text-sm text-center max-w-xs mb-10">
          Connect with verified providers in a safe, discreet environment.
        </p>

        {/* Action cards */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleNavigateToLogin}
            className="w-full bg-white text-gray-900 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 bg-trust-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-trust-200 transition-colors">
              <LogIn className="w-5 h-5 text-trust-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Log in</div>
              <div className="text-xs text-gray-500">Access your account</div>
            </div>
          </button>

          <button
            onClick={handleNavigateToSignUp}
            className="w-full bg-white/15 backdrop-blur-sm border border-white/30 text-white py-4 px-6 rounded-2xl hover:bg-white/25 transition-all duration-200 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Create account</div>
              <div className="text-xs text-white/70">Join as a host or client</div>
            </div>
          </button>

          <button
            onClick={handleBrowseAsGuest}
            className="w-full text-white/80 hover:text-white py-3 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Browse as guest
          </button>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="px-6 pb-10">
        <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Shield className="w-4 h-4 text-safe-300 mr-1" />
                <span className="text-white font-bold text-sm">100%</span>
              </div>
              <div className="text-white/60 text-xs">Verified hosts</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-gold-300 fill-current mr-1" />
                <span className="text-white font-bold text-sm">4.8</span>
              </div>
              <div className="text-white/60 text-xs">Avg. rating</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <span className="text-white font-bold text-sm">NZ</span>
              </div>
              <div className="text-white/60 text-xs">Based & local</div>
            </div>
          </div>
        </div>
        <p className="text-white/40 text-xs text-center mt-4">
          By continuing, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
