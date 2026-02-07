import React from 'react';
import { Star, MapPin, Clock, Shield } from 'lucide-react';
import { Service } from '../../../types';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div 
      className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={service.images[0]} 
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-trust-600 font-semibold text-sm">${service.price}</span>
        </div>
        {service.verified && (
          <div className="absolute top-3 left-3 bg-safe-500 rounded-full p-1">
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-2">
          <img 
            src={service.workerAvatar} 
            alt={service.workerName}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{service.workerName}</h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-xs text-gray-600">{service.rating} ({service.reviewCount})</span>
            </div>
          </div>
        </div>
        
        <h4 className="font-bold text-lg text-gray-900 mb-2">{service.title}</h4>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{service.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{service.duration}min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;