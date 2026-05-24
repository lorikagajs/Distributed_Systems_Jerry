import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { BaseService } from '../common/base/base.service';
import { TenantScopedCrudService } from '../common/interfaces/crud-service.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService
  extends BaseService<Coupon>
  implements TenantScopedCrudService<Coupon, CreateCouponDto, UpdateCouponDto>
{
  constructor(private readonly prisma: PrismaService) {
    super('Coupon');
  }

  findAll(tenantId: number) {
    return this.prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(tenantId: number, id: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, tenantId },
    });

    return this.ensureEntityFound(coupon, id);
  }

  async create(tenantId: number, dto: CreateCouponDto) {
    try {
      return await this.prisma.coupon.create({
        data: {
          code: dto.code.toUpperCase(),
          discount: dto.discount,
          tenantId,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      });
    } catch (error) {
      this.handleUniqueConstraint(
        error,
        'Coupon code already exists for this tenant',
      );
    }
  }

  async update(tenantId: number, id: number, dto: UpdateCouponDto) {
    await this.findOne(tenantId, id);
    try {
      return await this.prisma.coupon.update({
        where: { id },
        data: {
          code: dto.code?.toUpperCase(),
          discount: dto.discount,
          expiresAt:
            dto.expiresAt === undefined
              ? undefined
              : dto.expiresAt
                ? new Date(dto.expiresAt)
                : null,
        },
      });
    } catch (error) {
      this.handleUniqueConstraint(
        error,
        'Coupon code already exists for this tenant',
      );
    }
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  async apply(tenantId: number, dto: ApplyCouponDto) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        tenantId,
        code: dto.code.toUpperCase(),
      },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon "${dto.code}" not found`);
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    const originalAmount =
      dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : null;

    let discountedAmount: Prisma.Decimal | null = null;
    if (originalAmount !== null) {
      discountedAmount = Prisma.Decimal.max(
        originalAmount.sub(coupon.discount),
        new Prisma.Decimal(0),
      );
    }

    return {
      code: coupon.code,
      discount: coupon.discount,
      originalAmount,
      discountedAmount,
      savings:
        originalAmount !== null && discountedAmount !== null
          ? originalAmount.sub(discountedAmount)
          : coupon.discount,
    };
  }
}
