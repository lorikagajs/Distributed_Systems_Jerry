import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 1,
    description: 'Tenant that the new user belongs to.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenantId!: number;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'User email address, unique inside the tenant.',
  })
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    minLength: 8,
    description: 'Plain text password to hash before storage.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(120)
  password!: string;

  @ApiPropertyOptional({ example: 'Jerry' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Customer' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;
}
