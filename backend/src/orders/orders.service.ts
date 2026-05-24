import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BaseService } from '../common/base/base.service';

const orderInclude = {
  items: { include: { product: true } },
  user: { select: { id: true, email: true } },
} as const;

type OrderResponse = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

@Injectable()
export class OrdersService extends BaseService<OrderResponse> {
  constructor(private readonly prisma: PrismaService) {
    super('Order');
  }

  findAllForUser(tenantId: number, userId: number) {
    return this.prisma.order.findMany({
      where: { tenantId, userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(tenantId: number, userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId, userId },
      include: orderInclude,
    });
    return this.ensureEntityFound(order, id);
  }

  async create(tenantId: number, userId: number, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { tenantId, id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'One or more products are invalid for this tenant',
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = new Prisma.Decimal(0);
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}"`,
        );
      }
      const lineTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.add(lineTotal);
      orderItems.push({
        product: { connect: { id: product.id } },
        quantity: item.quantity,
        price: product.price,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          tenantId,
          totalAmount,
          items: { create: orderItems },
        },
        include: {
          items: { include: { product: true } },
        },
      }) as unknown as Promise<OrderResponse>;
    });
  }

  async updateStatus(
    tenantId: number,
    id: number,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
    });
    this.ensureFound(order, 'Order', id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
      },
    }) as unknown as Promise<OrderResponse>;
  }
}
