import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateActionLink {
  type: 'link';
  label: string;
  to: string;
}

interface EmptyStateActionButton {
  type: 'button';
  label: string;
  onClick: () => void;
}

type EmptyStateAction = EmptyStateActionLink | EmptyStateActionButton;

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  compact = false,
}: EmptyStateProps) {
  const iconSize = compact ? 'size-16' : 'size-24';
  const iconInner = compact ? 'size-8' : 'size-12';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-10' : 'py-20'
      } ${className}`}
    >
      <div
        className={`flex ${iconSize} items-center justify-center rounded-full bg-gray-100 text-gray-400`}
      >
        <Icon className={iconInner} aria-hidden />
      </div>
      <h2
        className={`font-bold text-gray-900 ${
          compact ? 'mt-4 text-lg' : 'mt-6 text-2xl'
        }`}
      >
        {title}
      </h2>
      <p
        className={`max-w-sm text-gray-600 ${
          compact ? 'mt-1 text-sm' : 'mt-2'
        }`}
      >
        {description}
      </p>
      {action && (
        <div className={compact ? 'mt-4' : 'mt-8'}>
          {action.type === 'link' ? (
            <Link
              to={action.to}
              className="inline-flex rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
