import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import type { OrderConfirmationEmailJobPayload } from './email.types';
import {
  buildOrderConfirmationHtml,
  buildOrderConfirmationSubject,
} from './templates/order-confirmation.template';

@Injectable()
export class TransactionalMailService {
  private readonly logger = new Logger(TransactionalMailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendOrderConfirmation(
    payload: OrderConfirmationEmailJobPayload,
  ): Promise<void> {
    const enabled =
      this.config.get<string>('EMAIL_ENABLED', 'true').toLowerCase() !==
      'false';

    if (!enabled) {
      this.logger.warn(
        `EMAIL_ENABLED=false — skipping order confirmation for order #${payload.orderId}`,
      );
      return;
    }

    const from = this.config.get<string>(
      'SMTP_FROM',
      `"${payload.tenant.storeName}" <noreply@localhost>`,
    );

    const overrideTo = this.config.get<string>('EMAIL_OVERRIDE_TO')?.trim();
    const recipient = overrideTo || payload.customerEmail;

    await this.mailer.sendMail({
      to: recipient,
      from,
      subject: buildOrderConfirmationSubject(payload),
      html: buildOrderConfirmationHtml(payload),
    });

    if (overrideTo && overrideTo !== payload.customerEmail) {
      this.logger.log(
        `Order confirmation for order #${payload.orderId} sent to ${recipient} (EMAIL_OVERRIDE_TO; account email is ${payload.customerEmail})`,
      );
      return;
    }

    this.logger.log(
      `Order confirmation email sent to ${recipient} for order #${payload.orderId}`,
    );
  }
}
