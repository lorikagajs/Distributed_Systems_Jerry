import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class ReviewsService extends BaseService<Review> {
  constructor(private readonly prisma: PrismaService) {
    super('Review');
  }

  findByProduct(tenantId: number, productId: number) {
    return this.prisma.review.findMany({
      where: { tenantId, productId },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(tenantId: number, id: number) {
    const review = await this.prisma.review.findFirst({
      where: { id, tenantId },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });
    return this.ensureEntityFound(review, id);
  }

  async create(tenantId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) {
      throw new BadRequestException(
        `Product with id ${dto.productId} not found in this tenant`,
      );
    }

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          productId: dto.productId,
          rating: dto.rating,
          comment: dto.comment,
          tenantId,
        },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, email: true } },
        },
      });
    } catch (error) {
      this.handleUniqueConstraint(
        error,
        'You have already reviewed this product',
      );
    }
  }

  async update(tenantId: number, id: number, dto: UpdateReviewDto) {
    await this.findOne(tenantId, id);
    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });
  }

  async removeOwn(tenantId: number, userId: number, id: number) {
    const review = await this.findOne(tenantId, id);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    return this.prisma.review.delete({ where: { id } });
  }
}
