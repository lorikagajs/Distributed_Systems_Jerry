import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsIn, Max } from 'class-validator';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'popular';

function toNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const numbers = values
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));

  return numbers.length > 0 ? numbers : undefined;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search products by name (partial match)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search products by name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @Transform(({ value }) => toNumberArray(value))
  @IsInt({ each: true })
  categoryId?: number[];

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum average rating' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    enum: ['newest', 'price_asc', 'price_desc', 'popular'],
  })
  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'popular'])
  sort?: ProductSort;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Products per page', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
