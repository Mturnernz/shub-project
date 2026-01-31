import React from 'react';
import { Eye, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onBrowseAsGuest: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignUpSelection: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onBrowseAsGuest,
  onNavigateToLogin,
  onNavigateToSignUpSelection,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-600 to-warm-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Shub</h1>
          </div>
          <p className="text-trust-100 text-lg">
            Connect, Browse, Book
          </p>
          <p className="text-trust-200 text-sm mt-2">
            Discover amazing services from verified providers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Log In */}
          <button
            onClick={onNavigateToLogin}
            className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-trust-500 to-warm-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Log In</h3>
                <p className="text-gray-600 text-sm">
                  Access your existing account
                </p>
              </div>
            </div>
          </button>

          {/* Create Account */}
          <button
            onClick={onNavigateToSignUpSelection}
            className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-safe-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Create Account</h3>
                <p className="text-gray-600 text-sm">
                  Join as a host or client
                </p>
              </div>
            </div>
          </button>

          {/* Browse as Guest */}
          <button
            onClick={onBrowseAsGuest}
            className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-trust-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Browse as Guest</h3>
                <p className="text-gray-600 text-sm">
                  Explore services without creating an account
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-trust-100 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;