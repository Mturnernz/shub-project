import React from 'react';
import { CheckCircle, ArrowRight, UserCheck, Users } from 'lucide-react';

interface EmailVerificationSuccessPageProps {
  userType: 'worker' | 'client';
  onProceed: () => void;
}

const EmailVerificationSuccessPage: React.FC<EmailVerificationSuccessPageProps> = ({
  userType,
  onProceed,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Congratulations!</h1>
            </div>
          </div>
          <p className="text-trust-100 text-lg">
            Your email has been verified successfully
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              userType === 'worker'
                ? 'bg-gradient-to-br from-rose-500 to-trust-500'
                : 'bg-gradient-to-br from-trust-500 to-rose-500'
            }`}>
              {userType === 'worker' ? (
                <UserCheck className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to Shub!
            </h2>
            
            <p className="text-gray-600 mb-4">
              Your {userType} account has been successfully created and verified.
              {userType === 'worker'
                ? ' You can now set up your profile and start offering your services.'
                : ' You can now browse and book amazing services from verified workers.'
              }
            </p>

            <div className="bg-safe-50 border border-safe-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-600 mr-2" />
                <span className="text-safe-800 font-medium">Account Setup Complete</span>
              </div>
              <p className="text-safe-700 text-sm mt-1">
                You're all set to start using Shub!
              </p>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={onProceed}
            className="w-full bg-gradient-to-r from-trust-600 to-rose-600 text-white py-4 rounded-xl font-semibold hover:from-trust-700 hover:to-rose-700 transition-all duration-200 flex items-center justify-center"
          >
            {userType === 'worker' ? 'Set Up My Profile' : 'Start Browsing'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Welcome Tips */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">
            {userType === 'worker' ? 'Worker Tips:' : 'Getting Started:'}
          </h4>
          <ul className="text-trust-100 text-sm space-y-2">
            {userType === 'worker' ? (
              <>
                <li>• Complete your profile with photos and bio</li>
                <li>• Add your services and set competitive pricing</li>
                <li>• Verify your qualifications to build trust</li>
                <li>• Set your availability and service areas</li>
              </>
            ) : (
              <>
                <li>• Browse services by category or location</li>
                <li>• Read worker profiles and reviews</li>
                <li>• Use search filters to find exactly what you need</li>
                <li>• Book securely through our platform</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccessPage;