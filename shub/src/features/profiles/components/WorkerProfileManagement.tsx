import React, { useState } from 'react';
import { ArrowLeft, User, Image, FileText, Settings, MapPin, Globe, CheckCircle, Mail, Eye, Send, Shield, AlertTriangle, DollarSign } from 'lucide-react';
import { useWorkerProfile } from '../hooks/useWorkerProfile';
import { useServices } from '../../listings/hooks/useServices';
import { moderateProfileContent } from '../../safety/services/content-moderation';
import { useAuthStore } from '../../auth/stores/auth.store';
import PhotoManager from './PhotoManager';
import BioEditor from './BioEditor';
import ServiceManager from './ServiceManager';
import AvailabilitySetter from './AvailabilitySetter';
import LocationServiceArea from './LocationServiceArea';
import LanguageQualifications from './LanguageQualifications';
import WorkerProfilePreview from './WorkerProfilePreview';
import RatesEditor from './RatesEditor';

type Section = 'overview' | 'photos' | 'bio' | 'services' | 'availability' | 'location' | 'languages' | 'rates';

interface WorkerProfileManagementProps {
  onBack: () => void;
  userId: string;
}

const WorkerProfileManagement: React.FC<WorkerProfileManagementProps> = ({ onBack, userId }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [showPreview, setShowPreview] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [condomsMandatory, setCondomsMandatory] = useState(true);
  const [displayNameInput, setDisplayNameInput] = useState<string | null>(null);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const { profile, loading, error, updateProfile, saving } = useWorkerProfile(userId);
  const { services, loading: servicesLoading } = useServices();
  const { userProfile: authProfile, setUserProfile } = useAuthStore();

  // Filter services for the current worker
  const workerServices = services.filter(service => service.workerId === userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview' as Section, label: 'Overview', icon: User, color: 'text-trust-600' },
    { id: 'photos' as Section, label: 'Photos', icon: Image, color: 'text-warm-600' },
    { id: 'bio' as Section, label: 'Bio', icon: FileText, color: 'text-indigo-600' },
    { id: 'rates' as Section, label: 'Rates', icon: DollarSign, color: 'text-green-600' },
    { id: 'services' as Section, label: 'Services', icon: Settings, color: 'text-safe-600' },
    { id: 'availability' as Section, label: 'Status', icon: CheckCircle, color: 'text-orange-600' },
    { id: 'location' as Section, label: 'Location', icon: MapPin, color: 'text-trust-600' },
    { id: 'languages' as Section, label: 'Languages', icon: Globe, color: 'text-teal-600' },
  ];

  // Calculate profile completion (minimum 3 photos required)
  const getProfileCompletion = () => {
    let completed = 0;
    const total = 8;

    if (profile.profilePhotos && profile.profilePhotos.length >= 3) completed++;
    if (profile.bio && profile.bio.length >= 100) completed++;
    if (profile.hourlyRateText && profile.hourlyRateText.trim().length > 0) completed++;
    if (profile.primaryLocation) completed++;
    if (profile.serviceAreas && profile.serviceAreas.length > 0) completed++;
    if (profile.languages && profile.languages.length > 0) completed++;
    if (profile.status) completed++;
    if (workerServices.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();

  const handlePublishProfile = async () => {
    if (profileCompletion !== 100 || profile.isPublished) return;

    setPublishError(null);

    // Enforce condoms mandatory
    if (!condomsMandatory) {
      setPublishError('You must confirm that condom use is mandatory for all in-person services to publish your profile.');
      return;
    }

    // Run content moderation on bio and services
    const serviceNames = workerServices.map(s => s.title);
    const moderationResult = moderateProfileContent(
      profile.bio || '',
      serviceNames,
    );

    if (moderationResult.auto_block) {
      const violationList = moderationResult.violations.map(v => v.phrase).join(', ');
      setPublishError(
        `Your profile contains content that violates our safety guidelines: ${violationList}. ` +
        'Please update your bio or service descriptions and try again.'
      );
      return;
    }

    if (!moderationResult.safe) {
      setPublishError(
        'Your profile contains content that may need review. Please check your bio and service descriptions for any language that could be flagged, then try again.'
      );
      return;
    }

    try {
      await updateProfile({ isPublished: true });
      // Keep the auth store in sync so DashboardPage stops redirecting to profile setup
      if (authProfile) {
        setUserProfile({ ...authProfile, isPublished: true });
      }
    } catch (err) {
      setPublishError('Failed to publish profile. Please try again.');
    }
  };

  const canPublish = profileCompletion === 100 && !profile.isPublished && !saving && condomsMandatory;

  const currentDisplayName = displayNameInput !== null ? displayNameInput : (profile.name || '');

  const handleDisplayNameSave = async () => {
    if (displayNameInput === null || displayNameInput.trim() === profile.name) return;
    setDisplayNameSaving(true);
    try {
      await updateProfile({ name: displayNameInput.trim() });
      setDisplayNameInput(null);
    } finally {
      setDisplayNameSaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Display Name */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Display Name</h2>
              <p className="text-sm text-gray-500 mb-4">
                This is the name clients will see on your profile. Use a working name if you prefer — your real name is never shown publicly.
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={currentDisplayName}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="e.g. Sofia, Alex, Riley…"
                    maxLength={40}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleDisplayNameSave}
                  disabled={displayNameSaving || displayNameInput === null || displayNameInput.trim() === '' || displayNameInput.trim() === profile.name}
                  className="px-4 py-3 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {displayNameSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>
              <div className="flex items-center gap-6">
                {/* Circular completion ring */}
                <div className="relative flex-shrink-0">
                  <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                    <circle
                      cx="36" cy="36" r="30"
                      fill="none"
                      stroke="#0052A3"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - profileCompletion / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-trust-700">{profileCompletion}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {profileCompletion === 100
                      ? 'Your profile is complete and ready to publish!'
                      : 'Complete all sections to publish your profile and start receiving bookings.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {sections.slice(1).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left group"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-trust-100 to-warm-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{section.label}</h3>
                      <p className="text-sm text-gray-600">
                        {section.id === 'photos' && `${profile.profilePhotos?.length || 0}/10 photos (minimum 3 required)`}
                        {section.id === 'bio' && (profile.bio ? `${profile.bio.length} characters` : 'No bio added yet')}
                        {section.id === 'rates' && (profile.hourlyRateText ? profile.hourlyRateText : 'No rate information added yet')}
                        {section.id === 'services' && `${workerServices.length} service${workerServices.length !== 1 ? 's' : ''} listed`}
                        {section.id === 'availability' && `Currently ${profile.status || 'available'}`}
                        {section.id === 'location' && (profile.primaryLocation || 'No location set')}
                        {section.id === 'languages' && `${profile.languages?.length || 0} languages added`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Profile Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Status</h2>
              {profile.isPublished ? (
                <div className="bg-safe-50 border border-safe-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-safe-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-safe-900">Profile is Live!</h3>
                      <p className="text-safe-700 text-sm">Your profile is published and visible to clients.</p>
                    </div>
                  </div>
                </div>
              ) : profileCompletion === 100 ? (
                <div className="space-y-3">
                  <div className="bg-trust-50 border border-trust-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <Send className="w-6 h-6 text-trust-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-trust-900">Ready to Publish!</h3>
                        <p className="text-trust-700 text-sm">Your profile is complete. Confirm safer-sex policy to go live.</p>
                      </div>
                    </div>
                  </div>

                  {/* Condoms Mandatory Checkbox */}
                  <label className="flex items-start gap-3 p-4 bg-safe-50 border border-safe-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condomsMandatory}
                      onChange={(e) => { setCondomsMandatory(e.target.checked); setPublishError(null); }}
                      className="mt-0.5 w-5 h-5 text-safe-600 rounded focus:ring-safe-500"
                    />
                    <div>
                      <span className="font-semibold text-safe-800 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> Condom use is mandatory
                      </span>
                      <p className="text-sm text-safe-700 mt-1">
                        I confirm that condom use is mandatory for all in-person services. This is a requirement for publishing on Shub, consistent with safer-sex best practices under the Prostitution Reform Act 2003.
                      </p>
                    </div>
                  </label>

                  {/* Publish Error */}
                  {publishError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{publishError}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePublishProfile}
                    disabled={!canPublish}
                    className="w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-xl hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                  >
                    {saving ? 'Publishing...' : 'Publish Profile'}
                  </button>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-orange-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-orange-900">Profile Incomplete</h3>
                      <p className="text-orange-700 text-sm">
                        Complete all sections to publish your profile ({profileCompletion}% done).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'photos':
        return (
          <PhotoManager
            photos={profile.profilePhotos || []}
            photoSettings={profile.photoSettings || {}}
            onPhotosUpdate={(photos) => updateProfile({ profilePhotos: photos })}
            onPhotoSettingsUpdate={(photoSettings) => updateProfile({ photoSettings })}
            userId={userId}
          />
        );

      case 'bio':
        return (
          <BioEditor
            bio={profile.bio || ''}
            onBioUpdate={(bio) => updateProfile({ bio })}
          />
        );

      case 'rates':
        return (
          <RatesEditor
            hourlyRateText={profile.hourlyRateText || ''}
            onRateUpdate={(hourlyRateText) => updateProfile({ hourlyRateText })}
          />
        );

      case 'services':
        return (
          <ServiceManager
            workerId={userId}
            workerName={profile.name}
            workerAvatar={profile.avatar}
          />
        );

      case 'availability':
        return (
          <AvailabilitySetter
            status={profile.status || 'available'}
            statusMessage={profile.statusMessage}
            onStatusUpdate={(status, statusMessage) =>
              updateProfile({ status, statusMessage })
            }
          />
        );

      case 'location':
        return (
          <LocationServiceArea
            primaryLocation={profile.primaryLocation}
            serviceAreas={profile.serviceAreas || []}
            onLocationUpdate={(primaryLocation, serviceAreas) =>
              updateProfile({ primaryLocation, serviceAreas })
            }
          />
        );

      case 'languages':
        return (
          <LanguageQualifications
            languages={profile.languages || []}
            qualificationDocuments={profile.qualificationDocuments || []}
            onLanguagesUpdate={(languages) => updateProfile({ languages })}
            onDocumentsUpdate={(qualificationDocuments) =>
              updateProfile({ qualificationDocuments })
            }
            userId={userId}
          />
        );

      default:
        return null;
    }
  };

  const activeTab = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-trust-600 to-warm-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {showPreview ? 'Profile Preview' : activeSection === 'overview' ? 'Profile Management' : activeTab?.label}
              </h1>
              <p className="text-trust-100 text-sm">
                {showPreview
                  ? 'How your profile appears to clients'
                  : activeSection === 'overview'
                  ? `${profileCompletion}% complete`
                  : 'Manage your professional profile'
                }
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {!showPreview && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            )}
            {!profile.isPublished && profileCompletion === 100 && !showPreview && (
              <button
                onClick={handlePublishProfile}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-white/90 text-trust-600 hover:bg-white rounded-lg transition-colors font-semibold disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            )}
            {showPreview && (
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {activeSection !== 'overview' && (
        <div className="px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-white shadow-lg text-trust-600'
                    : 'bg-white/70 text-gray-600 hover:bg-white'
                }`}
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-20">
        {showPreview ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="p-6">
              <WorkerProfilePreview
                profile={profile}
                services={workerServices}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="p-6">
              {renderSection()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerProfileManagement;
