import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Tenant } from '@prisma/client';
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

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private resolveTenantId(req: Request, user: AuthUser): number {
    const scopedTenant = req['tenant'] as Tenant | undefined;
    const tenantId = scopedTenant?.id ?? user.tenantId;

    if (tenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Your account belongs to a different store. Please sign in again for this shop.',
      );
    }

    return tenantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get the current user cart' })
  getCart(@CurrentUser() user: AuthUser, @Req() req: Request) {
    const tenantId = this.resolveTenantId(req, user);
    return this.cartService.getCart(tenantId, user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart' })
  addItem(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Body() dto: AddCartItemDto,
  ) {
    const tenantId = this.resolveTenantId(req, user);
    return this.cartService.addItem(tenantId, user.userId, dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  updateItem(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    const tenantId = this.resolveTenantId(req, user);
    return this.cartService.updateItem(tenantId, user.userId, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove a cart item' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  removeItem(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const tenantId = this.resolveTenantId(req, user);
    return this.cartService.removeItem(tenantId, user.userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the cart' })
  clearCart(@CurrentUser() user: AuthUser, @Req() req: Request) {
    const tenantId = this.resolveTenantId(req, user);
    return this.cartService.clearCart(tenantId, user.userId);
  }
}
