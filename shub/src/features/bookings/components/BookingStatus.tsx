import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface BookingStatusProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  userRole?: 'worker' | 'client';
}

const BookingStatus: React.FC<BookingStatusProps> = ({
  status,
  size = 'md',
  showText = true,
  userRole
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: userRole === 'client' ? 'Accepted' : 'Confirmed',
          color: 'text-safe-600',
          bgColor: 'bg-safe-100',
          borderColor: 'border-safe-200'
        };
      case 'completed':
        return {
          icon: Calendar,
          text: 'Completed',
          color: 'text-trust-600',
          bgColor: 'bg-trust-100',
          borderColor: 'border-trust-200'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          text: 'Cancelled',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium border
      ${config.color} ${config.bgColor} ${config.borderColor} ${sizeClasses[size]}
    `}>
      <Icon className={iconSizes[size]} />
      {showText && config.text}
    </span>
  );
};

export default BookingStatus;