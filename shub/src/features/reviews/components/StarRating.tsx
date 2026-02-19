import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const [hovered, setHovered] = React.useState(0);
  const iconClass = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = interactive ? (hovered || rating) >= value : rating >= value;
        const half = !interactive && rating >= value - 0.5 && rating < value;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(value)}
            onMouseEnter={() => interactive && setHovered(value)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={interactive ? 'transition-transform hover:scale-110 active:scale-95' : 'cursor-default'}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
          >
            <Star
              className={`${iconClass} ${
                filled
                  ? 'text-gold-400 fill-current'
                  : half
                    ? 'text-gold-400'
                    : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
