import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { productImagesInclude } from '../products/product-images.helper';

const wishlistProductInclude = {
  category: true,
  images: productImagesInclude,
};

const wishlistInclude = {
  items: {
    include: {
      product: { include: wishlistProductInclude },
    },
  },
};

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(tenantId: number, userId: number) {
    const wishlist = await this.getOrCreateWishlist(tenantId, userId);
    return this.prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: wishlistInclude,
    });
  }

  async addItem(tenantId: number, userId: number, dto: AddWishlistItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) {
      throw new BadRequestException(
        `Product with id ${dto.productId} not found in this tenant`,
      );
    }

    const wishlist = await this.getOrCreateWishlist(tenantId, userId);

    try {
      await this.prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: dto.productId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Product is already in the wishlist');
      }
      throw error;
    }

    return this.getWishlist(tenantId, userId);
  }

  async removeItem(
    tenantId: number,
    userId: number,
    productId: number,
  ) {
    const wishlist = await this.getOrCreateWishlist(tenantId, userId);
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Product with id ${productId} is not in the wishlist`,
      );
    }

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });
    return this.getWishlist(tenantId, userId);
  }

  private async getOrCreateWishlist(tenantId: number, userId: number) {
    const existing = await this.prisma.wishlist.findFirst({
      where: { userId, tenantId },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.wishlist.create({
      data: { userId, tenantId },
    });
  }
}
