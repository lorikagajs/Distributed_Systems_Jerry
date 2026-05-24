import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
}

export function StarRatingInput({
  value,
  onChange,
  max = 5,
}: StarRatingInputProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`size-7 ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
