import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { ProductDescriptionDto } from './dto/product-description.dto';
import {
  ChatResponseDto,
  ProductDescriptionResponseDto,
} from './dto/ai-response.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('product-description')
  @ApiOperation({
    summary: 'Generate a product description from name and category',
  })
  @ApiOkResponse({ type: ProductDescriptionResponseDto })
  generateProductDescription(@Body() dto: ProductDescriptionDto) {
    return this.aiService.generateProductDescription(dto.name, dto.category);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Single-turn chat with the store assistant' })
  @ApiOkResponse({ type: ChatResponseDto })
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto.message);
  }
}
