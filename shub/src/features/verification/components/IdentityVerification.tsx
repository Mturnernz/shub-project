import React, { useState } from 'react';
import { Shield, Upload, Camera, CheckCircle, AlertTriangle, Clock, ArrowRight, ExternalLink, X, Eye } from 'lucide-react';
import { processVerificationDocuments, type VerificationResult } from '../services/verification';
import { useAuthStore } from '../../auth/stores/auth.store';

type VerificationStep = 'intro' | 'selfie' | 'document' | 'processing' | 'result';

const IdentityVerification: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { userProfile } = useAuthStore();
  const [step, setStep] = useState<VerificationStep>('intro');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'selfie' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setError(null);
    const preview = URL.createObjectURL(file);

    if (type === 'selfie') {
      setSelfieFile(file);
      setSelfiePreview(preview);
    } else {
      setDocumentFile(file);
      setDocumentPreview(preview);
    }
  };

  const handleSubmitVerification = async () => {
    if (!userProfile || !selfieFile || !documentFile) return;

    setStep('processing');
    setProcessing(true);
    setError(null);

    try {
      // In production, upload to Supabase Storage first
      // For now, use placeholder URLs
      const selfieUrl = selfiePreview || 'selfie-placeholder';
      const documentUrl = documentPreview || 'document-placeholder';

      const result = await processVerificationDocuments(
        userProfile.id,
        selfieUrl,
        documentUrl,
        userProfile.type === 'host' ? 'worker' : 'client'
      );

      if (result.success && result.verification) {
        setVerificationResult(result.verification);
        setStep('result');
      } else {
        setError(result.error || 'Verification failed. Please try again.');
        setStep('document');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setStep('document');
    } finally {
      setProcessing(false);
    }
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-trust-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
        <p className="text-gray-600 mt-2">
          Verify your identity to build trust and unlock full platform features.
        </p>
      </div>

      <div className="bg-trust-50 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-trust-800 text-sm">What you'll need:</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-trust-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-trust-800">Live selfie photo</p>
              <p className="text-xs text-trust-600">A clear photo of your face, taken now</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-trust-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-trust-800">Government-issued ID</p>
              <p className="text-xs text-trust-600">NZ driver licence, passport, or 18+ card</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-safe-50 border border-safe-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-safe-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-safe-800">Your privacy is protected</p>
            <p className="text-xs text-safe-600 mt-1">
              Documents are encrypted, used only for verification, and never shared.
              Your real name is not displayed on your profile.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700">
          <strong>NZ Prostitution Reform Act 2003:</strong> All platform participants must be 18+.
          Identity verification helps ensure compliance and protects all users.
        </p>
      </div>

      <button
        onClick={() => setStep('selfie')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 transition-colors"
      >
        Start Verification
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderSelfie = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">Step 1: Take a Selfie</h2>
        <p className="text-sm text-gray-600 mt-1">
          Take a clear photo of your face in good lighting
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-gray-500 space-y-1">
          <p>- Face the camera directly, no sunglasses or hats</p>
          <p>- Good lighting, no heavy shadows</p>
          <p>- Neutral expression, mouth closed</p>
          <p>- No filters or editing</p>
        </div>
      </div>

      {selfiePreview ? (
        <div className="relative">
          <img
            src={selfiePreview}
            alt="Selfie preview"
            className="w-full h-64 object-cover rounded-xl"
          />
          <button
            onClick={() => {
              setSelfieFile(null);
              setSelfiePreview(null);
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-trust-300 rounded-xl cursor-pointer hover:bg-trust-50 transition-colors">
          <Camera className="w-10 h-10 text-trust-400 mb-2" />
          <span className="text-sm font-medium text-trust-600">Take or upload a selfie</span>
          <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span>
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'selfie')}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('intro')}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('document')}
          disabled={!selfieFile}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDocument = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">Step 2: Upload ID</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload the front of your government-issued photo ID
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">Accepted documents:</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="bg-white rounded-lg p-2 text-center border">
            NZ Driver Licence
          </div>
          <div className="bg-white rounded-lg p-2 text-center border">
            NZ Passport
          </div>
          <div className="bg-white rounded-lg p-2 text-center border">
            HANZ 18+ Card
          </div>
        </div>
      </div>

      {documentPreview ? (
        <div className="relative">
          <img
            src={documentPreview}
            alt="Document preview"
            className="w-full h-48 object-contain rounded-xl bg-gray-100"
          />
          <button
            onClick={() => {
              setDocumentFile(null);
              setDocumentPreview(null);
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-trust-300 rounded-xl cursor-pointer hover:bg-trust-50 transition-colors">
          <Upload className="w-10 h-10 text-trust-400 mb-2" />
          <span className="text-sm font-medium text-trust-600">Upload ID front</span>
          <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'document')}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('selfie')}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmitVerification}
          disabled={!documentFile || !selfieFile}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit for Verification
          <Shield className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto animate-pulse">
        <Eye className="w-8 h-8 text-trust-600" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Verifying your identity</h2>
        <p className="text-sm text-gray-600 mt-2">
          This usually takes less than a minute...
        </p>
      </div>
      <div className="flex justify-center gap-1">
        <div className="w-2 h-2 rounded-full bg-trust-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-trust-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-trust-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  const renderResult = () => {
    if (!verificationResult) return null;

    const isApproved = verificationResult.status === 'approved';
    const isPending = verificationResult.status === 'pending';
    const isRejected = verificationResult.status === 'rejected';
    const needsResubmission = verificationResult.status === 'requires_resubmission';

    return (
      <div className="space-y-6">
        <div className="text-center">
          {isApproved && (
            <>
              <div className="w-16 h-16 rounded-full bg-safe-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-safe-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Verification Approved!</h2>
              <p className="text-sm text-gray-600 mt-2">
                Your identity has been verified. You now have access to all platform features.
              </p>
            </>
          )}

          {isPending && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Verification In Review</h2>
              <p className="text-sm text-gray-600 mt-2">
                Your documents are being reviewed by our team. This typically takes 1-24 hours.
                We'll notify you once the review is complete.
              </p>
            </>
          )}

          {isRejected && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Verification Not Approved</h2>
              <p className="text-sm text-gray-600 mt-2">
                We were unable to verify your identity. Please contact support for assistance.
              </p>
            </>
          )}

          {needsResubmission && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Resubmission Required</h2>
              <p className="text-sm text-gray-600 mt-2">
                We need clearer documents. Please retake your photos with better lighting and try again.
              </p>
            </>
          )}
        </div>

        {verificationResult.risk_flags.length > 0 && (isPending || needsResubmission) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-amber-800">Review notes:</p>
            {verificationResult.risk_flags.map((flag, i) => (
              <p key={i} className="text-xs text-amber-700">• {flag.details}</p>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {needsResubmission && (
            <button
              onClick={() => {
                setSelfieFile(null);
                setSelfiePreview(null);
                setDocumentFile(null);
                setDocumentPreview(null);
                setVerificationResult(null);
                setStep('selfie');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 transition-colors"
            >
              Try Again
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {(isApproved || isPending) && (
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-trust-600 text-white rounded-xl font-semibold hover:bg-trust-700 transition-colors"
            >
              {isApproved ? 'Continue to Dashboard' : 'Return to Dashboard'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
      {/* Progress indicator */}
      {step !== 'result' && step !== 'processing' && (
        <div className="flex items-center gap-2 mb-6">
          {['intro', 'selfie', 'document'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === s
                    ? 'bg-trust-600 text-white'
                    : ['intro', 'selfie', 'document'].indexOf(step) > i
                    ? 'bg-safe-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {['intro', 'selfie', 'document'].indexOf(step) > i ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-1 rounded ${
                    ['intro', 'selfie', 'document'].indexOf(step) > i
                      ? 'bg-safe-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {step === 'intro' && renderIntro()}
      {step === 'selfie' && renderSelfie()}
      {step === 'document' && renderDocument()}
      {step === 'processing' && renderProcessing()}
      {step === 'result' && renderResult()}
    </div>
  );
};

export default IdentityVerification;
