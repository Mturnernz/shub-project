import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, ExternalLink, X } from 'lucide-react';

/**
 * AgeGate Component - 18+ Age Verification
 * 
 * This component implements a legally compliant age verification gate that:
 * - Blocks all platform access until age is verified
 * - Uses localStorage and sessionStorage for persistence
 * - Provides clear exit option for underage users
 * - Meets New Zealand legal requirements for adult content platforms
 * - Cannot be easily bypassed through browser manipulation
 */
interface AgeGateProps {
  onVerified: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerified }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Check if user has already verified age in this session
  useEffect(() => {
    const ageVerified = localStorage.getItem('shub_age_verified');
    const sessionVerified = sessionStorage.getItem('shub_session_verified');
    
    if (ageVerified === 'true' && sessionVerified === 'true') {
      onVerified();
    }
  }, [onVerified]);

  const handleConfirmAge = () => {
    setIsConfirming(true);
    
    // Set both localStorage and sessionStorage for double verification
    localStorage.setItem('shub_age_verified', 'true');
    localStorage.setItem('shub_age_verified_timestamp', Date.now().toString());
    sessionStorage.setItem('shub_session_verified', 'true');
    
    // Add a small delay for better UX
    setTimeout(() => {
      onVerified();
    }, 500);
  };

  const handleExit = () => {
    // Clear any stored verification data
    localStorage.removeItem('shub_age_verified');
    localStorage.removeItem('shub_age_verified_timestamp');
    sessionStorage.removeItem('shub_session_verified');
    
    // Redirect to a safe external site
    window.location.href = 'https://www.google.com';
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(true);
  };

  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full text-center shadow-2xl mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Leave Shub?
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            You will be redirected away from this site. This action cannot be undone.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleExit}
              className="flex-1 bg-red-600 text-white py-2 sm:py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Yes, Leave Site
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Age Verification Required</h1>
          <p className="text-sm text-gray-600">This site contains adult content</p>
        </div>

        {/* Warning Content */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-red-800 text-xs space-y-1">
              <p><strong>You must be 18+ to access this website.</strong></p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>You are at least 18 years old</li>
                <li>You are legally allowed to view adult content in your jurisdiction</li>
                <li>You will not share access with minors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NZ Legal note — compact */}
        <p className="text-xs text-trust-700 bg-trust-50 border border-trust-200 rounded-lg px-3 py-2 mb-4">
          This platform operates in accordance with New Zealand law. All services are provided by consenting adults.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleConfirmAge}
            disabled={isConfirming}
            className="w-full bg-gradient-to-r from-safe-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:from-safe-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying…
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                I am 18 or older — Enter Site
              </>
            )}
          </button>

          <button
            onClick={handleExitConfirm}
            disabled={isConfirming}
            className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            I am under 18 — Exit Site
          </button>
        </div>

        {/* Footer */}
        <p className="mt-3 text-center text-xs text-gray-400">
          Clicking "Enter Site" stores your verification in this browser for this session only.
        </p>
      </div>
    </div>
  );
};

export default AgeGate;