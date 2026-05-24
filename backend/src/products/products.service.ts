import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto, ProductSortOption } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  images: { orderBy: { createdAt: 'asc' as const } },
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
    const created = await this.prisma.product.create({
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
    return this.withAverageRating(created);
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    }
    const updated = await this.prisma.product.update({
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
    return this.withAverageRating(updated);
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

      const result = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: productInclude,
      });
      return this.withAverageRating(result);
    });
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
    return this.prisma.product.delete({ where: { id } });
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
