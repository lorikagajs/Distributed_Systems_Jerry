import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Email or username (stored as email in the database)',
  })
  @IsString()
  @MinLength(1)
  email!: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 1, description: 'Tenant ID to scope login to' })
  @IsOptional()
  @IsInt()
  tenantId?: number;
}
