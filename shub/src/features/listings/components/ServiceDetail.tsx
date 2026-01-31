import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Shield, Heart, MessageSquare, Calendar } from 'lucide-react';
import { Service } from '../../../types';
import { useHostProfile } from '../../profiles/hooks/useHostProfile';
import { useAuth } from '../../auth/hooks/useAuth';
import { useBookings } from '../../bookings/hooks/useBookings';
import BookingRequest from '../../bookings/components/BookingRequest';

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
  onBook: () => void;
  userType?: 'host' | 'client' | null;
  onSignUpAsClient?: () => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onBook, userType, onSignUpAsClient }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showBookingRequest, setShowBookingRequest] = useState(false);

  const { userProfile } = useAuth();
  const { profile: hostProfile, loading: hostLoading } = useHostProfile(service.hostId);
  const { createNewBooking, loading: bookingLoading } = useBookings(
    userProfile?.id || null,
    userType
  );

  const isGuest = userType === null;
  const canBook = userType === 'client' && userProfile;

  const handleBookingRequest = async (request: any) => {
    if (!userProfile) {
      return { success: false, error: 'Please log in to make a booking' };
    }

    const result = await createNewBooking({
      ...request,
      client_id: userProfile.id
    });

    if (result.success) {
      setShowBookingRequest(false);
      // Could show success message or redirect
    }

    return result;
  };

  const handleBookNow = () => {
    if (isGuest && onSignUpAsClient) {
      onSignUpAsClient();
    } else if (canBook) {
      setShowBookingRequest(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          disabled={isGuest}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Heart className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
        </button>

        <img
          src={service.images[selectedImage]}
          alt={service.title}
          className="w-full h-80 object-cover"
        />
        
        <div className="flex justify-center space-x-2 mt-4 px-4">
          {service.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                selectedImage === index ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img 
                src={service.hostAvatar} 
                alt={service.hostName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{service.hostName}</h2>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{service.rating} ({service.reviewCount} reviews)</span>
                  {service.verified && (
                    <Shield className="w-4 h-4 text-green-500 ml-2" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">${service.price}</div>
              <div className="text-sm text-gray-500">per session</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h1>
          
          <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{service.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{service.duration} minutes</span>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>

          {/* Host Bio Section */}
          {hostProfile?.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {service.hostName}</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {hostProfile.bio}
                </p>
              </div>
            </div>
          )}
          
          {hostLoading && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {service.hostName}</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 italic">Loading host information...</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleBookNow}
              disabled={bookingLoading}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                isGuest
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 cursor-pointer'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              {bookingLoading ? 'Loading...' : isGuest ? 'Sign Up to Book' : 'Book Now'}
            </button>
            <button 
              onClick={isGuest ? onSignUpAsClient : undefined}
              disabled={!isGuest && !onSignUpAsClient}
              className={`px-6 py-4 border-2 rounded-xl font-semibold transition-colors ${
                isGuest 
                  ? 'border-green-200 text-green-600 hover:bg-green-50 cursor-pointer' 
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
          
        </div>
      </div>

      {/* Booking Request Modal */}
      {showBookingRequest && canBook && (
        <BookingRequest
          workerId={service.hostId}
          clientId={userProfile!.id}
          workerName={service.hostName}
          onSubmit={handleBookingRequest}
          onCancel={() => setShowBookingRequest(false)}
          isLoading={bookingLoading}
        />
      )}
    </div>
  );
};

export default ServiceDetail;