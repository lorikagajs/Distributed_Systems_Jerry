import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: 'What is your return policy?' })
  @IsString()
  @MinLength(1)
  message!: string;
}
