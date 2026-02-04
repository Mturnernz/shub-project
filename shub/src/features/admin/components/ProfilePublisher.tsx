import React, { useState, useEffect } from 'react';
import { UserCheck, Eye, Check, X, RefreshCw, MapPin, DollarSign, Image, FileText } from 'lucide-react';
import {
  getUnpublishedProfiles,
  publishProfile,
  unpublishProfile,
  type UnpublishedProfile,
} from '../services/admin';
import { useAuthStore } from '../../auth/stores/auth.store';

interface ProfilePublisherProps {
  onActionComplete?: () => void;
}

const ProfilePublisher: React.FC<ProfilePublisherProps> = ({ onActionComplete }) => {
  const { userProfile } = useAuthStore();
  const [profiles, setProfiles] = useState<UnpublishedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UnpublishedProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await getUnpublishedProfiles();
    if (data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handlePublish = async (profile: UnpublishedProfile) => {
    if (!userProfile) return;
    setActionLoading(true);

    const result = await publishProfile(profile.user_id, userProfile.id);

    if (result.success) {
      setSelectedProfile(null);
      fetchProfiles();
      onActionComplete?.();
    } else {
      alert(`Error: ${result.error}`);
    }

    setActionLoading(false);
  };

  const handleUnpublish = async () => {
    if (!selectedProfile || !userProfile || !unpublishReason.trim()) return;
    setActionLoading(true);

    const result = await unpublishProfile(selectedProfile.user_id, userProfile.id, unpublishReason);

    if (result.success) {
      setSelectedProfile(null);
      setUnpublishReason('');
      setShowUnpublishModal(false);
      fetchProfiles();
      onActionComplete?.();
    } else {
      alert(`Error: ${result.error}`);
    }

    setActionLoading(false);
  };

  const getComplianceStatus = (profile: UnpublishedProfile) => {
    const issues: string[] = [];

    if (!profile.condoms_mandatory) {
      issues.push('Condoms mandatory not set');
    }
    if (!profile.bio || profile.bio.length < 100) {
      issues.push('Bio too short (min 100 chars)');
    }
    if (profile.photo_album.length < 3) {
      issues.push(`Only ${profile.photo_album.length}/3 photos`);
    }
    if (!profile.region) {
      issues.push('No region set');
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-trust-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Publishing</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {profiles.length} ready to publish
          </span>
        </div>
        <button
          onClick={fetchProfiles}
          className="p-2 text-gray-600 hover:text-trust-600 hover:bg-trust-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No unpublished profiles ready for review</p>
          <p className="text-sm text-gray-500 mt-1">Workers must be verified before their profiles appear here</p>
        </div>
      )}

      {/* Profile list */}
      {!loading && profiles.length > 0 && (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const compliance = getComplianceStatus(profile);

            return (
              <div
                key={profile.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-trust-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {profile.photo_album[0] ? (
                        <img
                          src={profile.photo_album[0]}
                          alt={profile.user?.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {profile.user?.display_name || 'Unknown'}
                        </h3>
                        {profile.user?.is_verified && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {profile.city || profile.region || 'No location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {profile.hourly_rate_text || 'No rate set'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Image className="w-3.5 h-3.5" />
                          {profile.photo_album.length} photos
                        </span>
                      </div>

                      {/* Tagline preview */}
                      {profile.tagline && (
                        <p className="text-sm text-gray-600 italic">"{profile.tagline}"</p>
                      )}

                      {/* Compliance issues */}
                      {!compliance.compliant && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {compliance.issues.map((issue, i) => (
                            <span
                              key={i}
                              className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="flex items-center gap-1 px-3 py-1.5 text-trust-600 border border-trust-300 text-sm font-medium rounded-lg hover:bg-trust-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handlePublish(profile)}
                      disabled={!compliance.compliant || actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Preview Modal */}
      {selectedProfile && !showUnpublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Profile Preview: {selectedProfile.user?.display_name}
                </h3>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Photo gallery */}
              {selectedProfile.photo_album.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Photos ({selectedProfile.photo_album.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProfile.photo_album.slice(0, 6).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Bio</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                  {selectedProfile.bio || 'No bio provided'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedProfile.bio?.length || 0} characters (min 100 required)
                </p>
              </div>

              {/* Services */}
              {selectedProfile.services.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.services.map((service, i) => (
                      <span
                        key={i}
                        className="bg-trust-100 text-trust-800 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance check */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3">Compliance Check</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    {selectedProfile.condoms_mandatory ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span>Condoms mandatory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {(selectedProfile.bio?.length || 0) >= 100 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span>Bio minimum 100 characters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {selectedProfile.photo_album.length >= 3 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span>Minimum 3 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {selectedProfile.region ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span>Region set</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handlePublish(selectedProfile)}
                  disabled={actionLoading || !getComplianceStatus(selectedProfile).compliant}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Publish Profile'}
                </button>
                <button
                  onClick={() => setShowUnpublishModal(true)}
                  disabled={actionLoading}
                  className="px-6 py-3 text-red-600 border border-red-300 font-medium rounded-xl hover:bg-red-50 transition-colors"
                >
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unpublish/Request Changes Modal */}
      {showUnpublishModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Profile Changes</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What changes are needed?
              </label>
              <textarea
                value={unpublishReason}
                onChange={(e) => setUnpublishReason(e.target.value)}
                placeholder="Describe the changes needed..."
                className="w-full p-3 border border-gray-300 rounded-xl resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUnpublish}
                disabled={actionLoading || !unpublishReason.trim()}
                className="flex-1 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Sending...' : 'Send Feedback'}
              </button>
              <button
                onClick={() => {
                  setShowUnpublishModal(false);
                  setUnpublishReason('');
                }}
                className="flex-1 py-2 text-gray-600 border border-gray-300 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePublisher;
