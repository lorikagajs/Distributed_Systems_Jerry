import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class CartService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super('Cart');
  }

  async getCart(tenantId: number, userId: number) {
    const cart = await this.getOrCreateCart(tenantId, userId);
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async addItem(tenantId: number, userId: number, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) {
      throw new BadRequestException(
        `Product with id ${dto.productId} not found in this tenant`,
      );
    }

    const cart = await this.getOrCreateCart(tenantId, userId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(tenantId, userId);
  }

  async updateItem(
    tenantId: number,
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(tenantId, userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    this.ensureFound(item, 'Cart item', itemId);

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(tenantId, userId);
  }

  async removeItem(tenantId: number, userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(tenantId, userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    const found = this.ensureFound(item, 'Cart item', itemId);

    await this.prisma.cartItem.delete({ where: { id: found.id } });
    return this.getCart(tenantId, userId);
  }

  async clearCart(tenantId: number, userId: number) {
    const cart = await this.getOrCreateCart(tenantId, userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(tenantId, userId);
  }

  private async getOrCreateCart(tenantId: number, userId: number) {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, tenantId },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.cart.create({
      data: { userId, tenantId },
    });
  }
}
