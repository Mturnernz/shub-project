import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface EmailVerificationPendingProps {
  email: string;
  userType: 'worker' | 'client';
  onBack: () => void;
}

const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({
  email,
  userType,
  onBack,
}) => {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleResendEmail = async () => {
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/?verified=true`,
        }
      });

      if (resendError) throw resendError;

      setResendSuccess(true);
      setCooldown(60);
      cooldownRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-600 to-warm-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-3">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
            </div>
          </div>
          <p className="text-trust-100">
            We've sent a verification link to verify your account
          </p>
        </div>

        {/* Verification Instructions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-safe-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Almost there!
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification email to:
            </p>
            <div className="bg-trust-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-trust-800">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-trust-50 rounded-lg p-4">
              <h3 className="font-medium text-trust-900 mb-2">Next Steps:</h3>
              <ol className="text-sm text-trust-800 space-y-2">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  Click the "Verify Email\" button in the email
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  {userType === 'worker'
                    ? 'Complete your host profile setup'
                    : 'Start browsing and booking services'
                  }
                </li>
              </ol>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="bg-safe-50 border border-safe-200 text-safe-600 px-4 py-3 rounded-lg text-sm">
                Verification email sent successfully! Please check your inbox.
              </div>
            )}

            <div className="text-center pt-4 space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resending || cooldown > 0}
                className="flex items-center justify-center w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-lg font-semibold hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <button
                onClick={onBack}
                className="flex items-center justify-center w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-trust-100 text-sm">
            Having trouble? The verification email may take a few minutes to arrive.
            <br />
            Check your spam or junk folder if you don't see it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;