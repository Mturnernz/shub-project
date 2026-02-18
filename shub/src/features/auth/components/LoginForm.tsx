import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
    if (resetMessage) setResetMessage(null);
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first, then click "Forgot your password?"');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address first');
      return;
    }

    setResetLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        { redirectTo: `${window.location.origin}/` }
      );
      if (resetError) throw resetError;
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from login');
      }

      // Success! useAuthInit will handle profile fetch/creation via onAuthStateChange
      onLoginSuccess();

    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before logging in.');
        } else if (err.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a moment before trying again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-trust-500 to-warm-500 flex items-center justify-center mr-3">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            </div>
          </div>
          <p className="text-trust-100">Log in to your Shub account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-trust-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-lg font-semibold hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Log In'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            {resetMessage && (
              <div className="mb-3 bg-safe-50 border border-safe-200 text-safe-700 px-4 py-3 rounded-lg text-sm">
                {resetMessage}
              </div>
            )}
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-sm text-trust-600 hover:text-trust-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Sending...' : 'Forgot your password?'}
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-trust-100 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onBack}
              className="text-white font-semibold underline hover:text-trust-200 transition-colors"
            >
              Go back to sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;