import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  images: { orderBy: { createdAt: 'asc' as const } },
  reviews: { select: { rating: true } },
};

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(tenantId: number, query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { tenantId };
    const search = query.search ?? query.name;

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
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

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const products = await this.prisma.product.findMany({
      where,
      include: productInclude,
    });

    const filteredProducts = products
      .map((product) => this.withAverageRating(product))
      .filter((product) =>
        query.minRating === undefined
          ? true
          : (product.averageRating ?? 0) >= query.minRating,
      )
      .sort((a, b) => this.compareProducts(a, b, query.sort ?? 'newest'));

    const total = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      data: filteredProducts.slice(start, start + limit),
      total,
      page,
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
    return this.withAverageRating(product);
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
    return this.withAverageRating(product);
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

      const currentProduct = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!currentProduct?.imageUrl) {
        await tx.product.update({
          where: { id: productId },
          data: { imageUrl },
        });
      }

      const updatedProduct = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: productInclude,
      });
      return this.withAverageRating(updatedProduct);
    });
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
    return this.prisma.product.delete({ where: { id } });
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

  private withAverageRating(product: ProductRecord) {
    const { reviews, ...productData } = product;
    const averageRating =
      reviews.length === 0
        ? null
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length;

    return {
      ...productData,
      averageRating,
    };
  }

  private compareProducts(
    a: ReturnType<ProductsService['withAverageRating']>,
    b: ReturnType<ProductsService['withAverageRating']>,
    sort: NonNullable<ProductQueryDto['sort']>,
  ) {
    switch (sort) {
      case 'price_asc':
        return Number(a.price) - Number(b.price);
      case 'price_desc':
        return Number(b.price) - Number(a.price);
      case 'popular':
        return (b.averageRating ?? 0) - (a.averageRating ?? 0) || b.id - a.id;
      case 'newest':
      default:
        return b.id - a.id;
    }
  }
}
