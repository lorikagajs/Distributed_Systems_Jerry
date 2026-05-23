import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 1,
    description: 'Tenant that owns this category.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenantId!: number;

  @ApiProperty({
    example: 'Electronics',
    description: 'Display name for the category.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'electronics',
    description: 'Tenant-unique URL slug for the category.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'Devices, accessories, and related products.',
    description: 'Optional category description.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 3,
    nullable: true,
    description: 'Parent category ID for hierarchical category trees.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this category is visible/active.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
