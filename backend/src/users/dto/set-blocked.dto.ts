import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetBlockedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isBlocked!: boolean;
}
