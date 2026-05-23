import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class TenantQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Tenant scope used to isolate category data.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenantId!: number;
}
