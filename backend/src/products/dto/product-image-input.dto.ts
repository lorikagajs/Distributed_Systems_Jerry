import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ProductImageInputDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsString()
  @MinLength(1)
  url!: string;

  @ApiPropertyOptional({
    description: 'Cloudinary public_id when the URL is a Cloudinary asset',
  })
  @IsOptional()
  @IsString()
  publicId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
