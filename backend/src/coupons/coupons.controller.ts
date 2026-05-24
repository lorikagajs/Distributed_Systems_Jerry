import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { BaseController } from '../common/base/base.controller';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController extends BaseController<CouponsService> {
  constructor(couponsService: CouponsService) {
    super(couponsService);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all coupons (admin only)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(this.tenantIdFrom(user));
  }

  @Post('apply')
  @ApiOperation({ summary: 'Validate and apply a coupon code' })
  apply(@CurrentUser() user: AuthUser, @Body() dto: ApplyCouponDto) {
    return this.service.apply(this.tenantIdFrom(user), dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a coupon (admin only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCouponDto) {
    return this.service.create(this.tenantIdFrom(user), dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(this.tenantIdFrom(user), id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a coupon (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.service.update(this.tenantIdFrom(user), id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(this.tenantIdFrom(user), id);
  }
}
