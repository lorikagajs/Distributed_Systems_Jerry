import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_QUEUE,
  ORDER_CONFIRMATION_JOB,
} from './email.constants';
import type { OrderConfirmationEmailJobPayload } from './email.types';
import { isEmailQueueEnabled } from './email-queue.config';
import { TransactionalMailService } from './transactional-mail.service';
import { resolveProductImageUrl } from './utils/resolve-product-image-url';

type OrderForEmail = Prisma.OrderGetPayload<{
  include: {
    user: { select: { email: true; name: true } };
    items: {
      include: {
        product: {
          include: { images: { orderBy: { isPrimary: 'desc' } } };
        };
      };
    };
  };
}>;

@Injectable()
export class EmailProducerService {
  private readonly logger = new Logger(EmailProducerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionalMail: TransactionalMailService,
    private readonly config: ConfigService,
    @Optional() @InjectQueue(EMAIL_QUEUE) private readonly emailQueue?: Queue,
  ) {}

  /**
   * Enqueues an order-confirmation email after checkout succeeds.
   * Failures are logged only — the order itself is never rolled back.
   */
  async enqueueOrderConfirmation(order: OrderForEmail): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: order.tenantId },
      select: {
        name: true,
        email: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        storeName: true,
      },
    });

    if (!tenant) {
      this.logger.warn(
        `Tenant ${order.tenantId} not found — skipping email for order #${order.id}`,
      );
      return;
    }

    const payload = this.buildOrderConfirmationPayload(order, tenant);

    if (!isEmailQueueEnabled(this.config) || !this.emailQueue) {
      await this.transactionalMail.sendOrderConfirmation(payload);
      this.logger.log(
        `Sent ${ORDER_CONFIRMATION_JOB} synchronously for order #${order.id} to ${payload.customerEmail}`,
      );
      return;
    }

    const jobId = `order-confirmation-${order.id}`;

    try {
      await this.emailQueue.add(ORDER_CONFIRMATION_JOB, payload, {
        jobId,
      });
      this.logger.log(
        `Enqueued ${ORDER_CONFIRMATION_JOB} job ${jobId} for ${payload.customerEmail}`,
      );
    } catch (err) {
      this.logger.warn(
        `Redis queue unavailable for order #${order.id}, sending email synchronously`,
        err instanceof Error ? err.message : err,
      );
      await this.transactionalMail.sendOrderConfirmation(payload);
    }
  }

  private buildOrderConfirmationPayload(
    order: OrderForEmail,
    tenant: {
      name: string;
      email: string;
      logoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
      storeName: string | null;
    },
  ): OrderConfirmationEmailJobPayload {
    const customerName =
      order.user.name?.trim() ||
      order.user.email.split('@')[0] ||
      'Customer';

    const currency = 'EUR';

    return {
      customerEmail: order.user.email,
      customerName,
      orderId: order.id,
      orderTotal: Number(order.totalAmount),
      currency,
      items: order.items.map((line) => ({
        name: line.product.name,
        price: Number(line.price),
        quantity: line.quantity,
        imageUrl: resolveProductImageUrl(line.product),
      })),
      tenant: {
        storeName: tenant.storeName ?? tenant.name,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor ?? '#4f46e5',
        secondaryColor: tenant.secondaryColor ?? '#7c3aed',
        supportEmail: tenant.email,
      },
    };
  }
}
