import { Check } from 'lucide-react';
import { normalizeOrderStatus, type OrderStatusKey } from '../../utils/orders';

const STEPS: { key: OrderStatusKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function getActiveStepIndex(status: OrderStatusKey): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
    case 'PROCESSING':
      return 1;
    case 'SHIPPED':
      return 2;
    case 'DELIVERED':
      return 3;
    case 'CANCELLED':
      return -1;
    default:
      return 0;
  }
}

interface OrderProgressTrackerProps {
  status: string;
}

export function OrderProgressTracker({ status }: OrderProgressTrackerProps) {
  const normalized = normalizeOrderStatus(status);

  if (normalized === 'CANCELLED') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        This order was cancelled and will not be shipped.
      </p>
    );
  }

  const activeIndex = getActiveStepIndex(normalized);

  return (
    <nav aria-label="Order progress" className="w-full">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.key}
              className={`flex items-center ${isLast ? '' : 'flex-1'}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isComplete
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : isCurrent
                        ? 'border-[var(--color-primary)] bg-white text-[var(--color-primary)]'
                        : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 hidden text-center text-xs font-medium sm:block ${
                    isComplete || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 sm:mx-4 ${
                    index < activeIndex
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-gray-700 sm:hidden">
        {STEPS[activeIndex]?.label ?? 'Pending'}
      </p>
    </nav>
  );
}
