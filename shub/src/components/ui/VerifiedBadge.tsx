import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm'
          ? 'text-[10px] px-1.5 py-0.5 bg-trust-100 text-trust-700'
          : 'text-xs px-2 py-1 bg-trust-100 text-trust-700',
        className
      )}
    >
      <BadgeCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
};

export default VerifiedBadge;
