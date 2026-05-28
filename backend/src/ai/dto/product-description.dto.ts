import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ProductDescriptionDto {
  @ApiProperty({ example: 'Wireless Bluetooth Headphones' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @MinLength(1)
  category!: string;
}
