import { ApiProperty } from '@nestjs/swagger';

export class ProductDescriptionResponseDto {
  @ApiProperty({
    example:
      'Experience premium sound with these wireless Bluetooth headphones...',
  })
  description!: string;
}

export class ChatResponseDto {
  @ApiProperty({
    example:
      'Our return policy allows returns within 30 days of purchase with proof of receipt.',
  })
  response!: string;
}
