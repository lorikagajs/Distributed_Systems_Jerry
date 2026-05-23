import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto, tenantId: number) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, tenantId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: CreateProductDto, tenantId: number) {
    const createData: Prisma.ProductUncheckedCreateInput = {
      tenantId,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      sku: data.sku,
      isActive: data.isActive,
    };

    try {
      return await this.prisma.product.create({ data: createData });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, tenantId: number, data: UpdateProductDto) {
    if (Object.values(data).every((value) => value === undefined)) {
      throw new BadRequestException('At least one product field is required');
    }

    const updateData: Prisma.ProductUpdateManyMutationInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      sku: data.sku,
      isActive: data.isActive,
    };

    try {
      const result = await this.prisma.product.updateMany({
        where: { id, tenantId },
        data: updateData,
      });

      if (result.count === 0) {
        throw new NotFoundException('Product not found');
      }

      return this.findOne(id, tenantId);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, tenantId: number) {
    const result = await this.prisma.product.deleteMany({
      where: { id, tenantId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Product not found');
    }

    return { deleted: true };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Product SKU already exists for tenant');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Tenant does not exist');
      }
    }

    throw error;
  }
}
