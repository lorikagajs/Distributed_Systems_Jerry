import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ShippingAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @MinLength(1)
  line1!: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Brussels' })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiPropertyOptional({ example: 'Brussels-Capital' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @MinLength(1)
  postalCode!: string;

  @ApiProperty({ example: 'Belgium' })
  @IsString()
  @MinLength(1)
  country!: string;
}
