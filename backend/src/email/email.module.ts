import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaModule } from '../prisma/prisma.module';
import {
  buildBullRootOptions,
  EMAIL_QUEUE_REGISTRATION,
  isEmailQueueEnabled,
} from './email-queue.config';
import { EmailProcessor } from './email.processor';
import { EmailProducerService } from './email-producer.service';
import { TransactionalMailService } from './transactional-mail.service';

function buildMailerImports() {
  return MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => {
      const host = config.get<string>('SMTP_HOST');
      const port = Number(config.get<string>('SMTP_PORT', '587'));
      const user = config.get<string>('SMTP_USER');
      const pass = config.get<string>('SMTP_PASS');
      const from = config.get<string>(
        'SMTP_FROM',
        '"Store" <noreply@localhost>',
      );

      const hasSmtp = Boolean(user?.trim() && pass?.trim());
      const smtpService = config.get<string>('EMAIL_SMTP_SERVICE')?.trim();
      const useGmailService =
        smtpService === 'gmail' || host?.includes('gmail.com');

      return {
        transport: hasSmtp
          ? useGmailService
            ? {
                service: 'gmail',
                auth: { user, pass },
              }
            : {
                host,
                port,
                secure: port === 465,
                requireTLS: port === 587,
                auth: { user, pass },
              }
          : {
              jsonTransport: true,
            },
        defaults: {
          from,
        },
      };
    },
    inject: [ConfigService],
  });
}

@Module({})
export class EmailModule {
  static register(): DynamicModule {
    const useQueueAtLoad = process.env.EMAIL_USE_QUEUE !== 'false';

    const imports: DynamicModule['imports'] = [
      PrismaModule,
      ConfigModule,
      buildMailerImports(),
    ];

    const providers: DynamicModule['providers'] = [
      EmailProducerService,
      TransactionalMailService,
    ];

    if (useQueueAtLoad) {
      imports.push(
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: buildBullRootOptions,
          inject: [ConfigService],
        }),
        BullModule.registerQueue(EMAIL_QUEUE_REGISTRATION),
      );
      providers.push(EmailProcessor);
    }

    return {
      module: EmailModule,
      imports,
      providers,
      exports: [EmailProducerService],
    };
  }
}
