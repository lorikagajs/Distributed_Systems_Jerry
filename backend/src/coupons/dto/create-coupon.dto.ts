import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    example: 1,
    description: 'Tenant that owns this coupon.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenantId!: number;

  @ApiProperty({
    example: 'SUMMER25',
    description: 'Tenant-unique discount code customers enter at checkout.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[a-z0-9_-]+$/i, {
    message: 'code can contain only letters, numbers, underscores, and dashes',
  })
  code!: string;

  @ApiPropertyOptional({
    example: 'Summer campaign discount.',
    description: 'Optional internal or customer-facing coupon description.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'How the discount value should be applied.',
  })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({
    example: 25,
    description:
      'Discount amount. Percentage coupons must be between 0 and 100.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue!: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiration date/time after which the coupon is invalid.',
  })
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;

  @ApiProperty({
    example: 100,
    description: 'Maximum number of times this coupon may be used.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit!: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of times this coupon has already been used.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  usedCount?: number;

  @ApiPropertyOptional({
    example: 50,
    nullable: true,
    description: 'Optional minimum order total required to use this coupon.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumOrder?: number | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this coupon can currently be used.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
