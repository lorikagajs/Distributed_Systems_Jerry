import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 1,
    description: 'Tenant scope for credential lookup.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenantId!: number;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
