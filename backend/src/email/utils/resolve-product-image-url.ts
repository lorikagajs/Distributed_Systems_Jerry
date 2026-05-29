/** Picks primary gallery image or legacy imageUrl for email templates. */
export function resolveProductImageUrl(product: {
  imageUrl: string | null;
  images?: { url: string; isPrimary: boolean }[];
}): string | null {
  if (product.imageUrl?.trim()) {
    return product.imageUrl.trim();
  }

  const images = product.images ?? [];
  if (images.length === 0) {
    return null;
  }

  const primary = images.find((img) => img.isPrimary) ?? images[0];
  return primary?.url?.trim() ?? null;
}
