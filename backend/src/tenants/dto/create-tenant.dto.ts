import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  email!: string;
}