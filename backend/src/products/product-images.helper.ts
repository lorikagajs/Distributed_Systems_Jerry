import { Prisma } from '@prisma/client';
import { ProductImageInputDto } from './dto/product-image-input.dto';

export const productImagesInclude = {
  orderBy: [
    { isPrimary: 'desc' as const },
    { createdAt: 'asc' as const },
  ],
};

export type ProductImageCreateData = {
  url: string;
  publicId: string;
  isPrimary: boolean;
};

export function normalizeImageInputs(
  imageUrls?: ProductImageInputDto[],
  legacyImageUrl?: string,
): ProductImageInputDto[] {
  if (imageUrls?.length) {
    return imageUrls;
  }
  if (legacyImageUrl?.trim()) {
    return [{ url: legacyImageUrl.trim(), isPrimary: true }];
  }
  return [];
}

export function buildImageCreateMany(
  inputs: ProductImageInputDto[],
): ProductImageCreateData[] {
  if (inputs.length === 0) return [];

  const primaryIndex = inputs.findIndex((img) => img.isPrimary === true);
  const resolvedPrimary = primaryIndex >= 0 ? primaryIndex : 0;

  return inputs.map((img, index) => ({
    url: img.url.trim(),
    publicId: img.publicId?.trim() ?? '',
    isPrimary: index === resolvedPrimary,
  }));
}

export function primaryImageUrlFromGallery(
  images: ProductImageCreateData[],
): string | null {
  if (images.length === 0) return null;
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0].url;
}
