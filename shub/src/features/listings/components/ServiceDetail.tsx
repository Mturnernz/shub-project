import React, { useState, useRef, useEffect } from 'react';
import { Star, MapPin, Clock, Shield, Heart, MessageSquare, Calendar, CheckCircle, User } from 'lucide-react';
import { Service } from '../../../types';
import { useWorkerProfile } from '../../profiles/hooks/useWorkerProfile';
import { useAuth } from '../../auth/hooks/useAuth';
import { useBookings } from '../../bookings/hooks/useBookings';
import BookingSheet from '../../bookings/components/BookingSheet';

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
  onBook: () => void;
  userType?: 'worker' | 'client' | null;
  onSignUpAsClient?: () => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onBook, userType, onSignUpAsClient }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showBookingRequest, setShowBookingRequest] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const bookButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFAB(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (bookButtonRef.current) observer.observe(bookButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const { userProfile } = useAuth();
  const { profile: workerProfile, loading: workerLoading } = useWorkerProfile(service.workerId);
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
      setBookingSuccess(true);
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
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50">
      <div className="relative">
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          disabled={isGuest}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Heart className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
        </button>

        {service.images?.[selectedImage] ? (
          <img
            src={service.images[selectedImage]}
            alt={service.title}
            className="w-full h-64 sm:h-80 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-trust-100 to-warm-100 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No image available</span>
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mt-4 px-4">
          {service.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                selectedImage === index ? 'bg-trust-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {service.workerAvatar ? (
                <img
                  src={service.workerAvatar}
                  alt={service.workerName}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full mr-4 bg-trust-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-trust-500" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{service.workerName}</h2>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{service.rating} ({service.reviewCount} reviews)</span>
                  {service.verified && (
                    <Shield className="w-4 h-4 text-safe-500 ml-2" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-trust-600">${service.price}</div>
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
          {workerProfile?.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {service.workerName}</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {workerProfile.bio}
                </p>
              </div>
            </div>
          )}
          
          {workerLoading && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About {service.workerName}</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 italic">Loading worker information...</p>
              </div>
            </div>
          )}

          {/* Booking Success Banner */}
          {bookingSuccess && (
            <div className="mb-4 p-4 bg-safe-50 border border-safe-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-safe-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-safe-800">Booking request sent!</h3>
                  <p className="text-sm text-safe-700 mt-1">
                    {service.workerName} will review your request. You&apos;ll be notified when they respond.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              ref={bookButtonRef}
              onClick={handleBookNow}
              disabled={bookingLoading || bookingSuccess}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                isGuest
                  ? 'bg-gradient-to-r from-safe-600 to-emerald-600 text-white hover:from-safe-700 hover:to-emerald-700 cursor-pointer'
                  : 'bg-gradient-to-r from-trust-600 to-warm-600 text-white hover:from-trust-700 hover:to-warm-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              {bookingLoading ? 'Loading...' : isGuest ? 'Sign Up to Book' : 'Book Now'}
            </button>
            {isGuest && (
              <button
                onClick={onSignUpAsClient}
                className="px-6 py-4 border-2 border-safe-200 text-safe-600 hover:bg-safe-50 rounded-xl font-semibold transition-colors cursor-pointer"
                title="Sign up to message"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
            {!isGuest && (
              <button
                disabled
                className="px-6 py-4 border-2 border-gray-200 text-gray-400 rounded-xl font-semibold cursor-not-allowed opacity-50"
                title="Messaging is available after a confirmed booking"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
          </div>
          
        </div>
      </div>

      {/* Sticky FAB */}
      {showFAB && canBook && !bookingSuccess && (
        <div className="fixed bottom-24 right-4 z-40">
          <button
            onClick={handleBookNow}
            disabled={bookingLoading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-trust-600 to-warm-600 text-white rounded-full shadow-lg hover:from-trust-700 hover:to-warm-700 transition-all duration-200 font-semibold text-sm disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>
      )}

      {/* Booking Sheet */}
      <BookingSheet
        open={showBookingRequest}
        onClose={() => setShowBookingRequest(false)}
        workerId={service.workerId}
        clientId={userProfile?.id || ''}
        workerName={service.workerName}
        onSubmit={handleBookingRequest}
        isLoading={bookingLoading}
      />
    </div>
  );
};

export default ServiceDetail;