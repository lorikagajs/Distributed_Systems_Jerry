import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { BaseController } from '../common/base/base.controller';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController extends BaseController<OrdersService> {
  constructor(ordersService: OrdersService) {
    super(ordersService);
  }

  @Get()
  @ApiOperation({ summary: 'List your orders' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAllForUser(this.tenantIdFrom(user), user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your orders by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOneForUser(this.tenantIdFrom(user), user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.service.create(this.tenantIdFrom(user), user.userId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(this.tenantIdFrom(user), id, dto);
  }
}
