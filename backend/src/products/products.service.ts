import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { RedisClientType } from '@redis/client';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto, ProductSortOption } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  buildImageCreateMany,
  normalizeImageInputs,
  primaryImageUrlFromGallery,
  productImagesInclude,
} from './product-images.helper';
import { PRODUCTS_LIST_CACHE_PREFIX } from './products-cache.constants';

const productInclude = {
  category: true,
  images: productImagesInclude,
  reviews: { select: { rating: true } },
};

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(tenantId: number, query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const nameFilter = query.search?.trim() || query.name?.trim();

    const where: Prisma.ProductWhereInput = { tenantId };

    if (nameFilter) {
      where.name = { contains: nameFilter, mode: 'insensitive' };
    }
    if (query.categoryId?.length) {
      where.categoryId = { in: query.categoryId };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    const products = await this.prisma.product.findMany({
      where,
      include: productInclude,
    });

    let enriched = products.map((product) => this.withAverageRating(product));

    if (query.minRating !== undefined) {
      enriched = enriched.filter(
        (product) =>
          product.averageRating != null &&
          product.averageRating >= query.minRating!,
      );
    }

    enriched = this.sortProducts(enriched, query.sort ?? ProductSortOption.NEWEST);

    const total = enriched.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;
    const data = enriched.slice(skip, skip + limit);

    return {
      data,
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }

  async findOne(tenantId: number, id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.withAverageRating(product);
  }

  async create(tenantId: number, dto: CreateProductDto) {
    await this.ensureCategoryInTenant(tenantId, dto.categoryId);

    const imageInputs = normalizeImageInputs(dto.imageUrls, dto.imageUrl);
    const imageCreates = buildImageCreateMany(imageInputs);
    const primaryUrl = primaryImageUrlFromGallery(imageCreates);

    const created = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        stock: dto.stock,
        categoryId: dto.categoryId,
        tenantId,
        imageUrl: primaryUrl,
        images:
          imageCreates.length > 0 ? { create: imageCreates } : undefined,
      },
      include: productInclude,
    });
    await this.invalidateProductsListCache(tenantId);
    return this.withAverageRating(created);
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    const existing = await this.findOne(tenantId, id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    }

    const hasGalleryUpdate =
      dto.imageUrls !== undefined || dto.imageUrl !== undefined;

    if (hasGalleryUpdate) {
      const imageInputs = normalizeImageInputs(dto.imageUrls, dto.imageUrl);
      const imageCreates = buildImageCreateMany(imageInputs);
      const primaryUrl = primaryImageUrlFromGallery(imageCreates);

      const oldPublicIds = existing.images
        .map((img) => img.publicId)
        .filter((pid) => pid.length > 0);

      await this.prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (imageCreates.length > 0) {
          await tx.productImage.createMany({
            data: imageCreates.map((row) => ({ ...row, productId: id })),
          });
        }
        await tx.product.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            price: dto.price,
            compareAtPrice: dto.compareAtPrice,
            stock: dto.stock,
            categoryId: dto.categoryId,
            imageUrl: primaryUrl,
          },
        });
      });

      if (oldPublicIds.length > 0) {
        void this.cloudinaryService.deleteByPublicIds(oldPublicIds);
      }
    } else {
      await this.prisma.product.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          stock: dto.stock,
          categoryId: dto.categoryId,
        },
      });
    }

    await this.invalidateProductsListCache(tenantId);
    return this.findOne(tenantId, id);
  }

  async uploadImage(
    tenantId: number,
    productId: number,
    file?: Express.Multer.File,
    setPrimary = false,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await this.findOne(tenantId, productId);

    const uploaded = await this.cloudinaryService.uploadProductImage(
      file,
      tenantId,
      productId,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const existingCount = await tx.productImage.count({
        where: { productId },
      });
      const makePrimary = setPrimary || existingCount === 0;

      if (makePrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      await tx.productImage.create({
        data: {
          productId,
          url: uploaded.url,
          publicId: uploaded.publicId,
          isPrimary: makePrimary,
        },
      });

      if (makePrimary) {
        await tx.product.update({
          where: { id: productId },
          data: { imageUrl: uploaded.url },
        });
      }

      const updatedProduct = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: productInclude,
      });

      return this.withAverageRating(updatedProduct);
    });

    await this.invalidateProductsListCache(tenantId);
    return result;
  }

  async uploadImages(
    tenantId: number,
    productId: number,
    files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one image file is required');
    }

    await this.findOne(tenantId, productId);

    const uploads = await Promise.all(
      files.map((file) =>
        this.cloudinaryService.uploadProductImage(file, tenantId, productId),
      ),
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const existingCount = await tx.productImage.count({
        where: { productId },
      });
      let needsPrimary = existingCount === 0;

      for (const uploaded of uploads) {
        const isPrimary = needsPrimary;
        if (isPrimary) {
          await tx.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });
        }

        await tx.productImage.create({
          data: {
            productId,
            url: uploaded.url,
            publicId: uploaded.publicId,
            isPrimary,
          },
        });

        if (isPrimary) {
          await tx.product.update({
            where: { id: productId },
            data: { imageUrl: uploaded.url },
          });
          needsPrimary = false;
        }
      }

      const updatedProduct = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: productInclude,
      });

      return this.withAverageRating(updatedProduct);
    });

    await this.invalidateProductsListCache(tenantId);
    return result;
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);

    void this.cloudinaryService.deleteProductFolder(tenantId, id);

    const deleted = await this.prisma.product.delete({ where: { id } });
    await this.invalidateProductsListCache(tenantId);
    return deleted;
  }

  private async invalidateProductsListCache(tenantId: number): Promise<void> {
    const redis = this.getRedisClient();
    const pattern = `*${PRODUCTS_LIST_CACHE_PREFIX}:${tenantId}*`;

    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return;
    }

    await this.cacheManager.clear();
  }

  private getRedisClient(): RedisClientType | null {
    for (const keyv of this.cacheManager.stores ?? []) {
      const store = keyv.opts?.store;
      if (
        store &&
        typeof store === 'object' &&
        'client' in store &&
        store.client
      ) {
        return store.client as RedisClientType;
      }
    }
    return null;
  }

  private withAverageRating(product: ProductWithRelations) {
    const { reviews, ...rest } = product;
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : null;

    return {
      ...rest,
      averageRating,
      reviewCount,
    };
  }

  private sortProducts(
    products: ReturnType<ProductsService['withAverageRating']>[],
    sort: ProductSortOption,
  ) {
    const sorted = [...products];

    switch (sort) {
      case ProductSortOption.PRICE_ASC:
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case ProductSortOption.PRICE_DESC:
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case ProductSortOption.POPULAR:
        sorted.sort((a, b) => {
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        });
        break;
      case ProductSortOption.NEWEST:
      default:
        sorted.sort((a, b) => b.id - a.id);
        break;
    }

    return sorted;
  }

  private async ensureCategoryInTenant(tenantId: number, categoryId: number) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, tenantId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with id ${categoryId} not found in this tenant`,
      );
    }
  }
}
