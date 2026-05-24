import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrderPaymentDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Last four digits of the card (demo checkout only)',
    example: '4242',
  })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  cardLast4?: string;
}
