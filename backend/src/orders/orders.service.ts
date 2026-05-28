import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ShippingStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const orderInclude = {
  items: { include: { product: true } },
  payments: { orderBy: { createdAt: 'desc' as const } },
  user: { select: { id: true, email: true } },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(tenantId: number, userId: number) {
    return this.prisma.order
      .findMany({
        where: { tenantId, userId },
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
      })
      .then((orders) => orders.map((order) => this.withShippingAddress(order)));
  }

  async findOneForUser(tenantId: number, userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId, userId },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return this.withShippingAddress(order);
  }

  async create(tenantId: number, userId: number, dto: CreateOrderDto) {
    this.validatePayment(dto.payment.method, dto.payment.cardLast4);

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

    const shippingAddress = dto.shipping;

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.address.create({
        data: {
          userId,
          street: this.formatStreet(shippingAddress),
          city: shippingAddress.city,
          country: shippingAddress.country,
          zipCode: shippingAddress.postalCode,
        },
      });

      const order = await tx.order.create({
        data: {
          userId,
          tenantId,
          totalAmount,
          status: OrderStatus.CONFIRMED,
          items: { create: orderItems },
          payments: {
            create: {
              method: dto.payment.method,
              status: PaymentStatus.COMPLETED,
              amount: totalAmount,
            },
          },
          shipping: {
            create: {
              carrier: 'Standard Delivery',
              status: ShippingStatus.PENDING,
            },
          },
        },
        include: orderInclude,
      });

      return this.attachShippingAddress(order, shippingAddress);
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
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: orderInclude,
    });
    return this.withShippingAddress(updated);
  }

  private validatePayment(method: PaymentMethod, cardLast4?: string) {
    const cardMethods: PaymentMethod[] = [
      PaymentMethod.CREDIT_CARD,
      PaymentMethod.DEBIT_CARD,
    ];
    if (cardMethods.includes(method) && !cardLast4) {
      throw new BadRequestException(
        'Card last 4 digits are required for card payments',
      );
    }
  }

  private formatStreet(address: ShippingAddressDto) {
    return [address.line1, address.line2].filter(Boolean).join(', ');
  }

  private attachShippingAddress<T extends { userId: number }>(
    order: T,
    shipping: ShippingAddressDto,
  ) {
    return {
      ...order,
      shippingAddress: {
        line1: shipping.line1,
        line2: shipping.line2 ?? null,
        city: shipping.city,
        state: shipping.state ?? null,
        postalCode: shipping.postalCode,
        country: shipping.country,
      },
    };
  }

  private async withShippingAddress<T extends { userId: number }>(order: T) {
    const address = await this.prisma.address.findFirst({
      where: { userId: order.userId },
      orderBy: { id: 'desc' },
    });

    if (!address) {
      return { ...order, shippingAddress: null };
    }

    const [line1, ...rest] = address.street.split(', ');
    const line2 = rest.length > 0 ? rest.join(', ') : null;

    return {
      ...order,
      shippingAddress: {
        line1,
        line2,
        city: address.city,
        state: null,
        postalCode: address.zipCode,
        country: address.country,
      },
    };
  }
}
