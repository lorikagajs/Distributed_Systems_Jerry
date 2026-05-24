import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { BaseController } from '../common/base/base.controller';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController extends BaseController<CartService> {
  constructor(cartService: CartService) {
    super(cartService);
  }

  @Get()
  @ApiOperation({ summary: 'Get the current user cart' })
  getCart(@CurrentUser() user: AuthUser) {
    return this.service.getCart(this.tenantIdFrom(user), user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart' })
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.service.addItem(this.tenantIdFrom(user), user.userId, dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.service.updateItem(this.tenantIdFrom(user), user.userId, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove a cart item' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  removeItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.removeItem(this.tenantIdFrom(user), user.userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the cart' })
  clearCart(@CurrentUser() user: AuthUser) {
    return this.service.clearCart(this.tenantIdFrom(user), user.userId);
  }
}
