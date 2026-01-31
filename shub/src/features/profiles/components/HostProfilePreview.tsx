import React from 'react';
import { Star, MapPin, Globe, Shield, CheckCircle, MessageSquare, Calendar, Clock, DollarSign } from 'lucide-react';
import { User, Service } from '../../../types';

interface HostProfilePreviewProps {
  profile: User;
  services: Service[];
}

const HostProfilePreview: React.FC<HostProfilePreviewProps> = ({ profile, services }) => {
  const getStatusColor = () => {
    switch (profile.status) {
      case 'available': return 'text-safe-600 bg-safe-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'away': return 'text-red-600 bg-red-100';
      default: return 'text-safe-600 bg-safe-100';
    }
  };

  const getStatusIcon = () => {
    switch (profile.status) {
      case 'available': return '🟢';
      case 'busy': return '🟡';
      case 'away': return '🔴';
      default: return '🟢';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-trust-500 to-warm-500 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start space-x-4 mb-6">
            <img
              src={profile.avatar || 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={profile.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.verified && (
                  <Shield className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getStatusIcon()}</span>
                <span className="font-medium capitalize">{profile.status || 'available'}</span>
              </div>
              
              {profile.statusMessage && (
                <p className="text-white/90 italic">"{profile.statusMessage}"</p>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-white/90">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.primaryLocation || profile.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-sm">New Host</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Photo Gallery */}
      {profile.profilePhotos && profile.profilePhotos.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="grid grid-cols-2 gap-4">
            {profile.profilePhotos.slice(0, 6).map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={photo}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
                {index === 5 && profile.profilePhotos!.length > 6 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{profile.profilePhotos!.length - 6} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{service.title}</h3>
                  <div className="text-right">
                    <div className="text-xl font-bold text-trust-600">${service.price}</div>
                    <div className="text-sm text-gray-500">per session</div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{service.duration}min</span>
                    </div>
                    <span className="bg-trust-100 text-trust-700 px-2 py-1 rounded-full text-xs">
                      {service.category}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gradient-to-r from-trust-600 to-warm-600 text-white rounded-lg text-xs hover:from-trust-700 hover:to-warm-700 transition-all duration-200">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Book
                    </button>
                    <button className="px-3 py-1 border border-trust-200 text-trust-600 rounded-lg text-xs hover:bg-trust-50 transition-colors">
                      <MessageSquare className="w-3 h-3 inline mr-1" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location & Service Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Location */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-trust-500" />
            Primary Location
          </h3>
          <p className="text-gray-700">{profile.primaryLocation || profile.location || 'Not specified'}</p>
        </div>

        {/* Service Areas */}
        {profile.serviceAreas && profile.serviceAreas.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-trust-500" />
              Service Areas
            </h3>
            <div className="space-y-2">
              {profile.serviceAreas.slice(0, 3).map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{area.city}</span>
                  <span className="text-sm text-gray-500">{area.radius}km radius</span>
                </div>
              ))}
              {profile.serviceAreas.length > 3 && (
                <p className="text-sm text-gray-500 italic">
                  +{profile.serviceAreas.length - 3} more areas
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-trust-500" />
            Languages Spoken
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.languages.map((lang, index) => (
              <div key={index} className="bg-trust-100 text-trust-800 px-3 py-2 rounded-full text-sm">
                {lang.language} - {lang.proficiency}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualifications */}
      {profile.qualificationDocuments && profile.qualificationDocuments.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-safe-500" />
            Verified Qualifications
          </h3>
          <div className="bg-safe-50 border border-safe-200 rounded-lg p-4">
            <p className="text-safe-800 text-sm">
              <Shield className="w-4 h-4 inline mr-2" />
              This host has uploaded {profile.qualificationDocuments.length} qualification document{profile.qualificationDocuments.length > 1 ? 's' : ''} for verification.
            </p>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-trust-500 to-warm-500 rounded-2xl p-6 text-white text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to Connect?</h3>
        <p className="text-trust-100 mb-4">
          Book a service or send a message to get started
        </p>
        <div className="flex space-x-3 justify-center">
          <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-colors">
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Send Message
          </button>
          <button className="bg-white text-trust-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-colors">
            <Calendar className="w-5 h-5 inline mr-2" />
            View Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostProfilePreview;