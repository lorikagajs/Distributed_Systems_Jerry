import { useState } from 'react';
import { Store } from 'lucide-react';

type TenantBannerImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallbackColor?: string;
  showFallbackIcon?: boolean;
};

export function TenantBannerImage({
  src,
  alt = '',
  className = 'size-full object-cover',
  fallbackColor = '#4f46e5',
  showFallbackIcon = false,
}: TenantBannerImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div
        className="flex size-full items-center justify-center"
        style={{ backgroundColor: fallbackColor }}
        aria-hidden={!showFallbackIcon}
      >
        {showFallbackIcon ? (
          <Store className="size-12 text-white/90" aria-hidden />
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
