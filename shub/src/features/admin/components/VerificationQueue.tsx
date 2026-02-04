import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Eye, RefreshCw, AlertTriangle, User, Calendar, Mail } from 'lucide-react';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationDocUrls,
  type PendingVerification,
} from '../services/admin';
import { useAuthStore } from '../../auth/stores/auth.store';

interface VerificationQueueProps {
  onActionComplete?: () => void;
}

const VerificationQueue: React.FC<VerificationQueueProps> = ({ onActionComplete }) => {
  const { userProfile } = useAuthStore();
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [docUrls, setDocUrls] = useState<{ selfieUrl: string; idFrontUrl: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const fetchVerifications = async () => {
    setLoading(true);
    const { data, error } = await getPendingVerifications({
      status: filter === 'all' ? undefined : 'pending',
    });
    if (data) {
      setVerifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const handleViewDocs = async (verification: PendingVerification) => {
    setSelectedVerification(verification);
    const urls = await getVerificationDocUrls(verification.selfie_url, verification.id_front_url);
    setDocUrls(urls);
  };

  const handleApprove = async () => {
    if (!selectedVerification || !userProfile) return;
    setActionLoading(true);

    const result = await approveVerification(selectedVerification.id, userProfile.id);

    if (result.success) {
      setSelectedVerification(null);
      setDocUrls(null);
      fetchVerifications();
      onActionComplete?.();
    } else {
      alert(`Error: ${result.error}`);
    }

    setActionLoading(false);
  };

  const handleReject = async (allowResubmission: boolean) => {
    if (!selectedVerification || !userProfile || !rejectReason.trim()) return;
    setActionLoading(true);

    const result = await rejectVerification(
      selectedVerification.id,
      userProfile.id,
      rejectReason,
      allowResubmission
    );

    if (result.success) {
      setSelectedVerification(null);
      setDocUrls(null);
      setRejectReason('');
      setShowRejectModal(false);
      fetchVerifications();
      onActionComplete?.();
    } else {
      alert(`Error: ${result.error}`);
    }

    setActionLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-trust-600" />
          <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
            {verifications.length} pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'pending' | 'all')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="pending">Pending Only</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={fetchVerifications}
            className="p-2 text-gray-600 hover:text-trust-600 hover:bg-trust-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && verifications.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No pending verifications</p>
        </div>
      )}

      {/* Verification list */}
      {!loading && verifications.length > 0 && (
        <div className="space-y-3">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-trust-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-trust-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-trust-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {verification.user?.display_name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {verification.user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(verification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    verification.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : verification.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {verification.role}
                  </span>
                  <button
                    onClick={() => handleViewDocs(verification)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-trust-600 text-white text-sm font-medium rounded-lg hover:bg-trust-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Review Modal */}
      {selectedVerification && docUrls && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Review: {selectedVerification.user?.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedVerification.user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setDocUrls(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Documents side by side */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Selfie</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    {docUrls.selfieUrl.startsWith('http') ? (
                      <img
                        src={docUrls.selfieUrl}
                        alt="Selfie"
                        className="w-full h-64 object-contain"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center text-gray-500">
                        <AlertTriangle className="w-8 h-8 mr-2" />
                        Document not available
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">ID Document (Front)</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    {docUrls.idFrontUrl.startsWith('http') ? (
                      <img
                        src={docUrls.idFrontUrl}
                        alt="ID Front"
                        className="w-full h-64 object-contain"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center text-gray-500">
                        <AlertTriangle className="w-8 h-8 mr-2" />
                        Document not available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification checklist */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Verification Checklist</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Selfie clearly shows the person's face</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>ID document is valid and not expired</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Person in selfie matches ID photo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Person appears to be 18 or older</span>
                  </li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Verification</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full p-3 border border-gray-300 rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReject(true)}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                Allow Resubmission
              </button>
              <button
                onClick={() => handleReject(false)}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Permanent Reject
              </button>
            </div>

            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              className="w-full mt-3 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
