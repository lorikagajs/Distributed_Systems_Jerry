import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import type { ProductImageRecord } from '../../types';

interface ProductGalleryProps {
  images: ProductImageRecord[];
  alt: string;
  fallbackUrls?: string[];
}

export function ProductGallery({
  images,
  alt,
  fallbackUrls = [],
}: ProductGalleryProps) {
  const gallery = useMemo(() => {
    if (images.length > 0) {
      return [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    }
    return fallbackUrls.map((url, index) => ({
      id: `fallback-${index}`,
      url,
      publicId: '',
      isPrimary: index === 0,
    }));
  }, [images, fallbackUrls]);

  const primaryIndex = useMemo(
    () => Math.max(0, gallery.findIndex((img) => img.isPrimary)),
    [gallery],
  );

  const [activeIndex, setActiveIndex] = useState(primaryIndex);

  useEffect(() => {
    setActiveIndex(primaryIndex);
  }, [primaryIndex, gallery.length]);

  const goTo = useCallback(
    (index: number) => {
      if (gallery.length === 0) return;
      const next = (index + gallery.length) % gallery.length;
      setActiveIndex(next);
    },
    [gallery.length],
  );

  const active = gallery[activeIndex];

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-400">
        <ImageOff className="size-16" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <img
          src={active.url}
          alt={alt}
          className="h-full w-full object-cover transition-opacity duration-200"
        />

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {gallery.map((img, index) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}${img.isPrimary ? ' (primary)' : ''}`}
              onClick={() => setActiveIndex(index)}
              className={`size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
