import { BadRequestException, Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { BaseService } from '../common/base/base.service';
import { TenantScopedCrudService } from '../common/interfaces/crud-service.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService
  extends BaseService<Category>
  implements
    TenantScopedCrudService<Category, CreateCategoryDto, UpdateCategoryDto>
{
  constructor(private readonly prisma: PrismaService) {
    super('Category');
  }

  findAll(tenantId: number) {
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: number, id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });

    return this.ensureEntityFound(category, id);
  }

  async create(tenantId: number, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: { name: dto.name, tenantId },
      });
    } catch (error) {
      this.handleUniqueConstraint(
        error,
        'Category name already exists for this tenant',
      );
    }
  }

  async update(tenantId: number, id: number, dto: UpdateCategoryDto) {
    await this.findOne(tenantId, id);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handleUniqueConstraint(
        error,
        'Category name already exists for this tenant',
      );
    }
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);

    const productCount = await this.prisma.product.count({
      where: { tenantId, categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${productCount} product(s) still assigned. Reassign or remove them first.`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
