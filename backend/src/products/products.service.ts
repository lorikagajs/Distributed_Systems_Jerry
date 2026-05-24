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
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCTS_LIST_CACHE_PREFIX } from './products-cache.constants';

const productInclude = {
  category: true,
  images: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  findAll(tenantId: number, query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { tenantId };

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
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

    return this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: number, id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(tenantId: number, dto: CreateProductDto) {
    await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
        tenantId,
        imageUrl: dto.imageUrl,
        images: dto.imageUrl
          ? { create: { url: dto.imageUrl } }
          : undefined,
      },
      include: productInclude,
    });
    await this.invalidateProductsListCache(tenantId);
    return product;
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    }
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
      },
      include: productInclude,
    });
    await this.invalidateProductsListCache(tenantId);
    return product;
  }

  async uploadImage(
    tenantId: number,
    productId: number,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await this.findOne(tenantId, productId);
    const imageUrl = await this.cloudinaryService.uploadImage(file);

    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.create({
        data: { productId, url: imageUrl },
      });

      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product?.imageUrl) {
        await tx.product.update({
          where: { id: productId },
          data: { imageUrl },
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: productInclude,
      });
    });
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
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
