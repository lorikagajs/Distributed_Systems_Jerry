import type { Category } from '../../types';

const RATING_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
  { value: 1, label: '1★ & above' },
] as const;

export interface ProductFiltersPanelProps {
  categories: Category[];
  selectedCategoryIds: number[];
  minPrice: string;
  maxPrice: string;
  minRating: number | null;
  onCategoryToggle: (categoryId: number, checked: boolean) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinRatingChange: (value: number | null) => void;
  onClearFilters: () => void;
}

export function ProductFiltersPanel({
  categories,
  selectedCategoryIds,
  minPrice,
  maxPrice,
  minRating,
  onCategoryToggle,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onClearFilters,
}: ProductFiltersPanelProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          Categories
        </h3>
        <ul className="mt-3 space-y-2">
          {categories.length === 0 && (
            <li className="text-sm text-gray-500">No categories</li>
          )}
          {categories.map((category) => (
            <li key={category.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={(e) =>
                    onCategoryToggle(category.id, e.target.checked)
                  }
                  className="size-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {category.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          Price range
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <input
          type="range"
          min={0}
          max={500}
          value={maxPrice || '500'}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="mt-4 w-full accent-[var(--color-primary)]"
          aria-label="Maximum price slider"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          Rating
        </h3>
        <ul className="mt-3 space-y-2">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="minRating"
                checked={minRating === null}
                onChange={() => onMinRatingChange(null)}
                className="size-4 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Any rating
            </label>
          </li>
          {RATING_OPTIONS.map(({ value, label }) => (
            <li key={value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === value}
                  onChange={() => onMinRatingChange(value)}
                  className="size-4 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Clear Filters
      </button>
    </div>
  );
}
