import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, UserCheck, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SignUpFormProps {
  userType: 'worker' | 'client';
  onBack: () => void;
  onSignUpSuccess: (type: 'worker' | 'client', email: string) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ userType, onBack, onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    // Name is only required for clients — hosts set a display name in their profile
    if (userType === 'client') {
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }
      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        return false;
      }
    }

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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            // Hosts do not provide a name at signup — they set a display name in their profile
            ...(userType === 'client' && { name: formData.name.trim() }),
            type: userType,
          },
          // Add redirect URL for email verification with success parameter
          emailRedirectTo: `${window.location.origin}/?verified=true`,
          }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from sign up');
      }

      // Success! Call the success handler
      onSignUpSuccess(userType, formData.email.trim());

    } catch (err) {
      console.error('Sign up error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else if (err.message.includes('Invalid email')) {
          setError('Please enter a valid email address');
        } else if (err.message.includes('Password should be at least 6 characters')) {
          setError('Password must be at least 6 characters long');
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
          
          <h1 className="text-4xl font-bold text-white mb-2">Join Shub</h1>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-3 ${
              userType === 'worker' 
                ? 'bg-gradient-to-br from-warm-500 to-trust-500'
                : 'bg-gradient-to-br from-trust-500 to-warm-500'
            }`}>
              {userType === 'worker' ? (
                <UserCheck className="w-6 h-6 text-white" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {userType === 'worker' ? 'Worker Account' : 'Client Account'}
              </h2>
              <p className="text-trust-100 text-sm">
                {userType === 'worker' ? 'Offer your services' : 'Browse and book services'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Input — clients only; hosts set a display name inside their profile */}
            {userType === 'client' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
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
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-trust-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-lg font-semibold hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : `Create ${userType === 'worker' ? 'Worker' : 'Client'} Account`}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <button className="text-trust-600 hover:text-trust-700 underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-trust-600 hover:text-trust-700 underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 text-sm">Password Requirements:</h4>
          <ul className="text-trust-100 text-xs space-y-1">
            <li>• At least 6 characters long</li>
            <li>• Must match confirmation password</li>
            <li>• Use a strong, unique password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;