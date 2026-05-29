import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, ORDER_CONFIRMATION_JOB } from './email.constants';
import type { OrderConfirmationEmailJobPayload } from './email.types';
import { TransactionalMailService } from './transactional-mail.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly transactionalMail: TransactionalMailService,
  ) {
    super();
  }

  async process(
    job: Job<OrderConfirmationEmailJobPayload, void, string>,
  ): Promise<void> {
    switch (job.name) {
      case ORDER_CONFIRMATION_JOB:
        await this.handleOrderConfirmation(job);
        return;
      default:
        throw new Error(`Unknown email job type: ${job.name}`);
    }
  }

  private async handleOrderConfirmation(
    job: Job<OrderConfirmationEmailJobPayload>,
  ): Promise<void> {
    this.logger.log(
      `Processing ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts ?? 1}) for order #${job.data.orderId}`,
    );

    await this.transactionalMail.sendOrderConfirmation(job.data);
  }
}
