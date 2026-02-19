import React, { useState } from 'react';
import { Star, MapPin, Clock, Shield, User, Heart } from 'lucide-react';
import { Service } from '../../../types';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  saved?: boolean;
  onSaveToggle?: (workerId: string) => void;
  isOnline?: boolean;
}

const FALLBACK_SERVICE_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e2e8f0"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="16"%3ENo image%3C/text%3E%3C/svg%3E';

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, saved = false, onSaveToggle, isOnline = false }) => {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const serviceImage = (!imgError && service.images?.[0]) || FALLBACK_SERVICE_IMG;
  const avatarSrc = service.workerAvatar;

  return (
    <div
      className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={serviceImage}
          alt={service.title}
          className="w-full h-48 object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-trust-600 font-semibold text-sm">${service.price}</span>
        </div>
        {service.verified && (
          <div className="absolute top-3 left-3 bg-safe-500 rounded-full p-1">
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}
        {onSaveToggle && (
          <button
            onClick={(e) => { e.stopPropagation(); onSaveToggle(service.workerId); }}
            aria-label={saved ? 'Remove from saved' : 'Save worker'}
            className="absolute bottom-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow transition-transform active:scale-90"
          >
            <Heart className={`w-4 h-4 transition-colors ${saved ? 'text-rose-500 fill-current' : 'text-gray-400'}`} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="relative mr-3 flex-shrink-0">
            {avatarSrc && !avatarError ? (
              <img
                src={avatarSrc}
                alt={service.workerName}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setAvatarError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-trust-100 flex items-center justify-center">
                <User className="w-4 h-4 text-trust-500" />
              </div>
            )}
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-safe-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{service.workerName}</h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
              <span className="text-xs text-gray-600">{service.rating} ({service.reviewCount})</span>
            </div>
          </div>
        </div>

        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{service.title}</h4>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center min-w-0">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            <Clock className="w-4 h-4 mr-1" />
            <span>{service.duration}min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
