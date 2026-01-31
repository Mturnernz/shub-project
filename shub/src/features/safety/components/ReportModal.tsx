import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Flag, Upload } from 'lucide-react';
import { submitReport, type ReportCategory } from '../services/reporting';

interface ReportModalProps {
  targetType: 'user' | 'message' | 'booking' | 'profile';
  targetId: string;
  targetName?: string;
  onClose: () => void;
  onReportSubmitted: () => void;
  reporterId: string;
}

interface ReportOption {
  category: ReportCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    category: 'unsafe_services',
    label: 'Unsafe Sexual Practices',
    description: 'Advertising unsafe services, no condom use, or other health risks',
    icon: <Shield className="w-5 h-5" />,
    severity: 'critical'
  },
  {
    category: 'underage_concern',
    label: 'Underage Concern',
    description: 'Suspected minor or age-inappropriate content',
    icon: <AlertTriangle className="w-5 h-5" />,
    severity: 'critical'
  },
  {
    category: 'harassment',
    label: 'Harassment or Abuse',
    description: 'Threatening, degrading, or abusive behavior',
    icon: <Flag className="w-5 h-5" />,
    severity: 'high'
  },
  {
    category: 'threatening_behavior',
    label: 'Threats or Violence',
    description: 'Threats of violence, self-harm, or dangerous behavior',
    icon: <AlertTriangle className="w-5 h-5" />,
    severity: 'critical'
  },
  {
    category: 'fake_profile',
    label: 'Fake Profile',
    description: 'Fraudulent identity, stolen photos, or impersonation',
    icon: <Flag className="w-5 h-5" />,
    severity: 'medium'
  },
  {
    category: 'payment_fraud',
    label: 'Payment Fraud',
    description: 'Scam attempts, fake payment requests, or financial fraud',
    icon: <Flag className="w-5 h-5" />,
    severity: 'high'
  },
  {
    category: 'privacy_violation',
    label: 'Privacy Violation',
    description: 'Sharing private information, photos, or personal details without consent',
    icon: <Shield className="w-5 h-5" />,
    severity: 'high'
  },
  {
    category: 'spam_scam',
    label: 'Spam or Scam',
    description: 'Unwanted promotional content, external links, or scam attempts',
    icon: <Flag className="w-5 h-5" />,
    severity: 'low'
  },
  {
    category: 'other',
    label: 'Other',
    description: 'Other safety or policy violations not listed above',
    icon: <Flag className="w-5 h-5" />,
    severity: 'medium'
  }
];

const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetName,
  onClose,
  onReportSubmitted,
  reporterId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'category' | 'details' | 'confirmation'>('category');

  const selectedOption = REPORT_OPTIONS.find(opt => opt.category === selectedCategory);

  const handleCategorySelect = (category: ReportCategory) => {
    setSelectedCategory(category);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitReport({
        reporter_id: reporterId,
        target_type: targetType,
        target_id: targetId,
        category: selectedCategory,
        description: description.trim(),
        urgency: selectedOption?.severity === 'critical' ? 'emergency' : 'medium'
      });

      if (result.success) {
        setStep('confirmation');
        setTimeout(() => {
          onReportSubmitted();
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-trust-600 bg-trust-50 border-trust-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Report {targetType === 'user' ? 'User' : 'Content'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {targetName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Reporting: <span className="font-medium">{targetName}</span>
            </p>
          </div>
        )}

        {/* Category Selection */}
        {step === 'category' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">What type of issue are you reporting?</h3>
              <p className="text-sm text-gray-600">
                Select the category that best describes the problem.
              </p>
            </div>

            <div className="space-y-2">
              {REPORT_OPTIONS.map((option) => (
                <button
                  key={option.category}
                  onClick={() => handleCategorySelect(option.category)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors hover:bg-gray-50 ${getSeverityColor(option.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{option.label}</span>
                        {option.severity === 'critical' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-90">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && selectedOption && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('category')}
              className="text-sm text-trust-600 hover:text-trust-700 flex items-center gap-1"
            >
              ← Back to categories
            </button>

            <div className={`p-4 border rounded-lg ${getSeverityColor(selectedOption.severity)}`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedOption.icon}
                <span className="font-medium">{selectedOption.label}</span>
              </div>
              <p className="text-sm">{selectedOption.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe the issue in detail *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific details about what happened, when it occurred, and any other relevant information that will help our moderation team..."
                rows={5}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {selectedOption.severity === 'critical' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">High Priority Report</h4>
                    <p className="text-sm text-red-800">
                      This type of report will be escalated immediately to our moderation team.
                      If this is an emergency requiring immediate assistance, please contact local authorities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('category')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-safe-100 rounded-full flex items-center justify-center mx-auto">
              <Flag className="w-8 h-8 text-safe-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">
                Thank you for helping keep our community safe. We'll review your report and take appropriate action.
              </p>
            </div>

            {selectedOption?.severity === 'critical' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>High priority reports</strong> are reviewed immediately by our moderation team.
                </p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              You'll receive updates if we need additional information.
            </div>
          </div>
        )}

        {/* Safety Resources */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>Emergency?</strong> Contact local authorities: NZ Police 111
            • <strong>Need support?</strong> NZPC Helpline: 04-382-8191
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;