import type { TenantConfig, TenantListItem } from '../api/tenants';
import type { Category, Product, ProductImageRecord, Review } from '../types';

function gallery(primary: string, ...extra: string[]): string[] {
  return [primary, ...extra];
}

function imageRecordsFromUrls(urls: string[]): ProductImageRecord[] {
  return urls.map((url, index) => ({
    id: `mock-img-${index}-${url.slice(-12)}`,
    url,
    publicId: '',
    isPrimary: index === 0,
  }));
}

function productWithGallery(
  product: Omit<Product, 'images' | 'imageRecords'> & { images: string[] },
): Product {
  return {
    ...product,
    imageRecords: imageRecordsFromUrls(product.images),
  };
}

export const MOCK_TENANT_LIST: TenantListItem[] = [
  {
    slug: 'nike',
    storeName: 'Nike Official Outlet',
    storeDescription:
      'Just Do It. Shop the latest Nike sneakers and apparel.',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    primaryColor: '#e11d48',
    secondaryColor: '#be123c',
    bannerUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  },
  {
    slug: 'adidas',
    storeName: 'Adidas Zone',
    storeDescription:
      'Impossible is nothing. Explore the 3-stripes collection.',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    primaryColor: '#0369a1',
    secondaryColor: '#075985',
    bannerUrl:
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800',
  },
];

export const MOCK_TENANT_CONFIGS: Record<string, TenantConfig> = {
  nike: {
    tenantId: 1,
    slug: 'nike',
    storeName: 'Nike Official Outlet',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    primaryColor: '#e11d48',
    secondaryColor: '#be123c',
    bannerUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
    storeDescription:
      'Just Do It. Shop the latest Nike sneakers and apparel.',
  },
  adidas: {
    tenantId: 2,
    slug: 'adidas',
    storeName: 'Adidas Zone',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    primaryColor: '#0369a1',
    secondaryColor: '#075985',
    bannerUrl:
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200',
    storeDescription:
      'Impossible is nothing. Explore the 3-stripes collection.',
  },
};

const nikeCategories: Category[] = [
  {
    id: 1,
    name: 'Footwear',
    slug: 'footwear',
    description: 'Sneakers and running shoes',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
  },
  {
    id: 2,
    name: 'Apparel',
    slug: 'apparel',
    description: 'Hoodies, jackets, and more',
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200',
  },
];

const adidasCategories: Category[] = [
  {
    id: 3,
    name: 'Footwear',
    slug: 'footwear',
    description: 'Performance running shoes',
    imageUrl:
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200',
  },
  {
    id: 4,
    name: 'Apparel',
    slug: 'apparel',
    description: 'Track jackets and sportswear',
    imageUrl:
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=200',
  },
];

export const MOCK_CATEGORIES: Record<number, Category[]> = {
  1: nikeCategories,
  2: adidasCategories,
};

const RAW_MOCK_PRODUCTS: Record<number, Omit<Product, 'imageRecords'>[]> = {
  1: [
    {
      id: 101,
      name: 'Nike Air Max 270',
      description: "Premium lifestyle sneaker with Nike's tallest Air unit.",
      price: 150,
      stock: 12,
      categoryId: 1,
      tenantId: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1606107557-8016fcb0932a?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      ),
      category: nikeCategories[0],
      ratings: 4.5,
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 102,
      name: 'Nike Tech Fleece Hoodie',
      description: 'Lightweight warmth with a streamlined look.',
      price: 130,
      stock: 5,
      categoryId: 2,
      tenantId: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      ),
      category: nikeCategories[1],
      ratings: 4.2,
      createdAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 103,
      name: 'Nike Dri-FIT Running Tee',
      description: 'Breathable fabric for everyday training.',
      price: 45,
      stock: 30,
      categoryId: 2,
      tenantId: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      ),
      category: nikeCategories[1],
      ratings: 4.0,
      createdAt: '2026-03-10T10:00:00Z',
    },
    {
      id: 104,
      name: 'Nike Revolution 6',
      description: 'Soft foam cushioning for all-day comfort.',
      price: 70,
      stock: 18,
      categoryId: 1,
      tenantId: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1606107557-8016fcb0932a?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1606107557-8016fcb0932a?w=800',
      ),
      category: nikeCategories[0],
      ratings: 4.3,
      createdAt: '2026-04-05T10:00:00Z',
    },
  ],
  2: [
    {
      id: 201,
      name: 'Adidas Ultraboost Light',
      description: 'Epic energy return in our lightest Ultraboost.',
      price: 190,
      stock: 8,
      categoryId: 3,
      tenantId: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      ),
      category: adidasCategories[0],
      ratings: 4.8,
      createdAt: '2026-05-01T10:00:00Z',
    },
    {
      id: 202,
      name: 'Adidas Tiro Track Jacket',
      description: 'Soccer style tailored for the streets.',
      price: 75,
      stock: 20,
      categoryId: 4,
      tenantId: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      ),
      category: adidasCategories[1],
      ratings: 4.0,
      createdAt: '2026-04-10T10:00:00Z',
    },
    {
      id: 203,
      name: 'Adidas Stan Smith',
      description: 'A timeless court classic.',
      price: 95,
      stock: 15,
      categoryId: 3,
      tenantId: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
      images: gallery(
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      ),
      category: adidasCategories[0],
      ratings: 4.6,
      createdAt: '2026-02-28T10:00:00Z',
    },
  ],
};

export const MOCK_PRODUCTS: Record<number, Product[]> = Object.fromEntries(
  Object.entries(RAW_MOCK_PRODUCTS).map(([tenantId, products]) => [
    Number(tenantId),
    products.map(productWithGallery),
  ]),
) as Record<number, Product[]>;

export const MOCK_REVIEWS: Record<number, Review[]> = {
  101: [
    {
      id: 1,
      userId: 10,
      productId: 101,
      rating: 5,
      comment: 'Incredibly comfortable for all-day wear. True to size.',
      user: {
        id: 10,
        name: 'Sarah M.',
        email: 'sarah@example.com',
        role: 'CUSTOMER',
      },
      createdAt: '2026-04-12T14:30:00Z',
    },
    {
      id: 2,
      userId: 11,
      productId: 101,
      rating: 4,
      comment: 'Great shoes, delivery was fast.',
      user: {
        id: 11,
        name: 'James K.',
        email: 'james@example.com',
        role: 'CUSTOMER',
      },
      createdAt: '2026-03-28T09:15:00Z',
    },
  ],
  201: [
    {
      id: 3,
      userId: 12,
      productId: 201,
      rating: 5,
      comment: 'Best running shoes I have owned.',
      user: {
        id: 12,
        name: 'Maria L.',
        email: 'maria@example.com',
        role: 'CUSTOMER',
      },
      createdAt: '2026-05-02T11:00:00Z',
    },
  ],
};
