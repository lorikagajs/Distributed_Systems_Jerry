import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = 'Loading',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="size-10 animate-spin text-[var(--color-primary)]"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
