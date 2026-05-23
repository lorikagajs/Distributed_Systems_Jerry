import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coupons for a tenant' })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Coupons returned successfully.' })
  findAll(@Query() query: TenantQueryDto) {
    return this.couponsService.findAll(query.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by ID for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Coupon returned successfully.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
  ) {
    return this.couponsService.findOne(id, query.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a coupon' })
  @ApiBody({ type: CreateCouponDto })
  @ApiCreatedResponse({ description: 'Coupon created successfully.' })
  create(@Body() body: CreateCouponDto) {
    return this.couponsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a coupon for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiBody({ type: UpdateCouponDto })
  @ApiOkResponse({ description: 'Coupon updated successfully.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
    @Body() body: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, query.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Coupon deleted successfully.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
  ) {
    return this.couponsService.remove(id, query.tenantId);
  }
}
