import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  maxStars?: number;
  size?: 'sm' | 'md';
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 'sm',
}: StarRatingProps) {
  const value = rating ?? 0;
  const starSize = size === 'md' ? 'size-5' : 'size-4';

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${value} out of ${maxStars}`}>
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => {
          const filled = value >= i + 1;
          const half = !filled && value >= i + 0.5;

          return (
            <Star
              key={i}
              className={`${starSize} ${
                filled || half
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
              aria-hidden
            />
          );
        })}
      </div>
      <span className="text-sm text-gray-600">
        {rating != null ? value.toFixed(1) : '—'}
      </span>
    </div>
  );
}
