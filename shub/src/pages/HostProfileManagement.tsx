import React, { useState } from 'react';
import { ArrowLeft, User, Image, FileText, Settings, MapPin, Globe, CheckCircle, Mail, Eye, Send } from 'lucide-react';
import { useHostProfile } from '../hooks/useHostProfile';
import { useServices } from '../hooks/useServices';
import PhotoManager from '../components/HostProfile/PhotoManager';
import BioEditor from '../components/HostProfile/BioEditor';
import ServiceManager from '../components/HostProfile/ServiceManager';
import AvailabilitySetter from '../components/HostProfile/AvailabilitySetter';
import LocationServiceArea from '../components/HostProfile/LocationServiceArea';
import LanguageQualifications from '../components/HostProfile/LanguageQualifications';
import HostProfilePreview from '../components/HostProfile/HostProfilePreview';

type Section = 'overview' | 'photos' | 'bio' | 'services' | 'availability' | 'location' | 'languages';

interface HostProfileManagementProps {
  onBack: () => void;
  userId: string;
}

const HostProfileManagement: React.FC<HostProfileManagementProps> = ({ onBack, userId }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [showPreview, setShowPreview] = useState(false);
  const { profile, loading, error, updateProfile, saving } = useHostProfile(userId);
  const { services, loading: servicesLoading } = useServices();

  // Filter services for the current host
  const hostServices = services.filter(service => service.hostId === userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview' as Section, label: 'Overview', icon: User, color: 'text-purple-600' },
    { id: 'photos' as Section, label: 'Photos', icon: Image, color: 'text-pink-600' },
    { id: 'bio' as Section, label: 'Bio', icon: FileText, color: 'text-indigo-600' },
    { id: 'services' as Section, label: 'Services', icon: Settings, color: 'text-green-600' },
    { id: 'availability' as Section, label: 'Status', icon: CheckCircle, color: 'text-orange-600' },
    { id: 'location' as Section, label: 'Location', icon: MapPin, color: 'text-blue-600' },
    { id: 'languages' as Section, label: 'Languages', icon: Globe, color: 'text-teal-600' },
  ];

  // Calculate profile completion
  const getProfileCompletion = () => {
    let completed = 0;
    const total = 7;

    if (profile.profilePhotos && profile.profilePhotos.length >= 1) completed++;
    if (profile.bio && profile.bio.length >= 100) completed++;
    if (profile.primaryLocation) completed++;
    if (profile.serviceAreas && profile.serviceAreas.length > 0) completed++;
    if (profile.languages && profile.languages.length > 0) completed++;
    if (profile.status) completed++;
    if (hostServices.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = getProfileCompletion();

  const handlePublishProfile = async () => {
    if (profileCompletion === 100 && !profile.isPublished) {
      try {
        console.log('Publishing profile...');
        await updateProfile({ isPublished: true });
        console.log('Profile published successfully!');
      } catch (err) {
        console.error('Error publishing profile:', err);
        // Show error message to user
        alert('Failed to publish profile. Please try again.');
      }
    }
  };

  const canPublish = profileCompletion === 100 && !profile.isPublished && !saving;

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-lg font-semibold text-purple-600">{profileCompletion}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Complete your profile to attract more clients and increase bookings.
              </p>
            </div>

            <div className="grid gap-4">
              {sections.slice(1).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left group"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{section.label}</h3>
                      <p className="text-sm text-gray-600">
                        {section.id === 'photos' && `${profile.profilePhotos?.length || 0}/10 photos (minimum 1 required)`}
                        {section.id === 'bio' && (profile.bio ? `${profile.bio.length} characters` : 'No bio added yet')}
                        {section.id === 'services' && `${hostServices.length} service${hostServices.length !== 1 ? 's' : ''} listed`}
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
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-green-900">Profile is Live!</h3>
                      <p className="text-green-700 text-sm">Your profile is published and visible to clients.</p>
                    </div>
                  </div>
                </div>
              ) : profileCompletion === 100 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Send className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Ready to Publish!</h3>
                        <p className="text-blue-700 text-sm">Your profile is complete and ready to go live.</p>
                      </div>
                    </div>
                    <button
                      onClick={handlePublishProfile}
                      disabled={!canPublish}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                    >
                      {saving ? 'Publishing...' : 'Publish Profile'}
                    </button>
                  </div>
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
            onPhotosUpdate={(photos) => updateProfile({ profilePhotos: photos })}
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

      case 'services':
        return (
          <ServiceManager
            hostId={userId}
            hostName={profile.name}
            hostAvatar={profile.avatar}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6 rounded-b-3xl shadow-lg">
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
              <p className="text-purple-100 text-sm">
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
                className="flex items-center px-4 py-2 bg-white/90 text-purple-600 hover:bg-white rounded-lg transition-colors font-semibold disabled:opacity-50"
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
                    ? 'bg-white shadow-lg text-purple-600'
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
              <HostProfilePreview
                profile={profile}
                services={hostServices}
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

export default HostProfileManagement;