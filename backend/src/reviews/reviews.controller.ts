import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { resolveTenantId } from '../common/utils/resolve-tenant-id';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReviewsService } from './reviews.service';
import { BaseController } from '../common/base/base.controller';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController extends BaseController<ReviewsService> {
  constructor(reviewsService: ReviewsService) {
    super(reviewsService);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List reviews for a product' })
  findByProduct(@Query() query: ReviewQueryDto, @Req() req: Request) {
    const tenantId = resolveTenantId(req.tenant, query.tenantId);
    return this.service.findByProduct(tenantId, query.productId);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Write a review for a product' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.service.create(this.tenantIdFrom(user), user.userId, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own review' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.removeOwn(this.tenantIdFrom(user), user.userId, id);
  }
}
