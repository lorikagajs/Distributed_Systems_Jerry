import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The JWT refresh token' })
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
