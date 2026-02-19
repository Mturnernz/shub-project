import React, { useState } from 'react';
import { Shield, CheckCircle, Phone } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Sheet from '../../../components/ui/Sheet';
import Button from '../../../components/ui/Button';
import { showToast } from '../../../utils/toast';

interface ClientVerificationCardProps {
  userId: string;
  isVerified: boolean;
  onVerified: () => void;
}

type Step = 'phone' | 'otp' | 'success';

const ClientVerificationCard: React.FC<ClientVerificationCardProps> = ({ userId, isVerified, onVerified }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isVerified) {
    return (
      <div className="bg-safe-50 border border-safe-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-safe-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-safe-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-safe-800">Verified Client</p>
          <p className="text-xs text-safe-600">Your identity has been verified via phone.</p>
        </div>
      </div>
    );
  }

  const handleSendOtp = async () => {
    const cleaned = phone.trim().replace(/\s/g, '');
    if (!cleaned) { setError('Enter your phone number'); return; }
    setLoading(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: cleaned });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setError('Enter the code from your SMS'); return; }
    setLoading(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim().replace(/\s/g, ''),
      token: otp.trim(),
      type: 'sms',
    });
    if (verifyError) {
      setLoading(false);
      setError(verifyError.message);
      return;
    }
    // Mark verified in users table
    await supabase
      .from('users')
      .update({
        client_verified_at: new Date().toISOString(),
        client_verification_method: 'phone',
      })
      .eq('id', userId);
    setLoading(false);
    setStep('success');
    showToast.success('Identity verified!');
    onVerified();
  };

  const handleClose = () => {
    setOpen(false);
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
  };

  return (
    <>
      <div className="bg-trust-50 border border-trust-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-trust-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-trust-900">Get Verified</p>
            <p className="text-xs text-trust-700 mt-0.5">
              Verified clients get access to more providers and appear more trustworthy.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 px-4 py-2 bg-trust-600 text-white rounded-lg text-xs font-medium hover:bg-trust-700 transition-colors"
            >
              Verify with Phone
            </button>
          </div>
        </div>
      </div>

      <Sheet open={open} onClose={handleClose} title="Verify Your Identity">
        {step === 'phone' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter your mobile number. We'll send a one-time code.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1.5" />
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+64 21 123 456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" loading={loading} onClick={handleSendOtp}>
              Send Code
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter the 6-digit code sent to {phone}.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-trust-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" loading={loading} onClick={handleVerifyOtp}>
              Verify
            </Button>
            <button onClick={() => setStep('phone')} className="w-full text-sm text-gray-500 hover:text-gray-700">
              Use a different number
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-safe-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-safe-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You're verified!</h3>
            <p className="text-sm text-gray-500 mb-6">Your verified badge will now appear on your bookings.</p>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        )}
      </Sheet>
    </>
  );
};

export default ClientVerificationCard;
