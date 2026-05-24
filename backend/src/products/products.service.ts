import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseService } from '../common/base/base.service';
import { TenantScopedCrudService } from '../common/interfaces/crud-service.interface';

const productInclude = {
  category: true,
  images: { orderBy: { createdAt: 'asc' as const } },
} as const;

type ProductResponse = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductsService
  extends BaseService<ProductResponse>
  implements
    TenantScopedCrudService<
      ProductResponse,
      CreateProductDto,
      UpdateProductDto,
      ProductQueryDto
    >
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    super('Product');
  }

  findAll(tenantId: number, query: ProductQueryDto = {}) {
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
    return this.ensureEntityFound(product, id);
  }

  async create(tenantId: number, dto: CreateProductDto) {
    await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    return this.prisma.product.create({
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
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryInTenant(tenantId, dto.categoryId);
    }
    return this.prisma.product.update({
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
    const product = await this.findOne(tenantId, id);
    await this.prisma.product.delete({ where: { id } });
    return product;
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
