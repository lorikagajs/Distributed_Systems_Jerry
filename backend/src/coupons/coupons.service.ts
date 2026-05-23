import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coupon, DiscountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: number) {
    return this.prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, tenantId: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, tenantId },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found for this tenant');
    }

    return coupon;
  }

  async create(data: CreateCouponDto) {
    this.validateCouponRules(data);

    return this.prisma.coupon.create({
      data: {
        ...data,
        code: data.code.trim().toUpperCase(),
        usedCount: data.usedCount ?? 0,
      },
    });
  }

  async update(id: number, tenantId: number, data: UpdateCouponDto) {
    const existingCoupon = await this.findOne(id, tenantId);
    this.validateCouponRules(data, existingCoupon);

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.trim().toUpperCase() : undefined,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  private validateCouponRules(data: UpdateCouponDto, existingCoupon?: Coupon) {
    const discountType = data.discountType ?? existingCoupon?.discountType;
    const discountValue =
      data.discountValue ?? Number(existingCoupon?.discountValue);
    const usageLimit = data.usageLimit ?? existingCoupon?.usageLimit;
    const usedCount = data.usedCount ?? existingCoupon?.usedCount ?? 0;

    if (
      discountType === DiscountType.PERCENTAGE &&
      discountValue !== undefined &&
      discountValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discountValue cannot exceed 100',
      );
    }

    if (usageLimit !== undefined && usedCount > usageLimit) {
      throw new BadRequestException('usedCount cannot exceed usageLimit');
    }
  }
}
