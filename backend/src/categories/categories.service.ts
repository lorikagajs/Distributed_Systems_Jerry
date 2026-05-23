import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: number) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: { parent: true, children: true },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number, tenantId: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { parent: true, children: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found for this tenant');
    }

    return category;
  }

  async create(data: CreateCategoryDto) {
    await this.assertValidParent(data.parentId, data.tenantId);

    return this.prisma.category.create({
      data,
      include: { parent: true, children: true },
    });
  }

  async update(id: number, tenantId: number, data: UpdateCategoryDto) {
    await this.findOne(id, tenantId);

    if (Object.prototype.hasOwnProperty.call(data, 'parentId')) {
      await this.assertValidParent(data.parentId, tenantId, id);
    }

    return this.prisma.category.update({
      where: { id },
      data,
      include: { parent: true, children: true },
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private async assertValidParent(
    parentId: number | null | undefined,
    tenantId: number,
    currentCategoryId?: number,
  ) {
    if (parentId == null) {
      return;
    }

    const visitedCategoryIds = new Set<number>();
    let nextParentId: number | null = parentId;

    while (nextParentId != null) {
      if (nextParentId === currentCategoryId) {
        throw new BadRequestException(
          'A category cannot be assigned to itself or one of its descendants',
        );
      }

      if (visitedCategoryIds.has(nextParentId)) {
        throw new BadRequestException('Category hierarchy contains a cycle');
      }

      visitedCategoryIds.add(nextParentId);

      const parent = await this.prisma.category.findFirst({
        where: { id: nextParentId, tenantId },
        select: { id: true, parentId: true },
      });

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found for this tenant',
        );
      }

      nextParentId = parent.parentId;
    }
  }
}
