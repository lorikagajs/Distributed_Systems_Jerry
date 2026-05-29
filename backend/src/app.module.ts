import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { createClient } from '@redis/client';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from './tenants/tenant.middleware';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { CouponsModule } from './coupons/coupons.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TenantsModule } from './tenants/tenants.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const ttlMs = Number(config.get('CACHE_TTL', 60)) * 1000;
        const redisUrl = config.get<string>(
          'REDIS_URL',
          'redis://localhost:6379',
        );

        let store: KeyvRedis<unknown> | undefined;
        try {
          const client = createClient({
            url: redisUrl,
            socket: {
              connectTimeout: 2000,
              reconnectStrategy: () => false,
            },
          });
          client.on('error', () => {});
          await client.connect();
          await client.disconnect();

          store = new KeyvRedis(redisUrl);
          console.log(
            `[Cache] Successfully connected to Redis at ${redisUrl}. Caching is enabled with Redis.`,
          );
        } catch (error: unknown) {
          store = undefined;
          const message =
            error instanceof Error ? error.message : String(error);
          console.warn(
            `[Cache] Failed to connect to Redis at ${redisUrl}. Falling back to in-memory cache. Error: ${message}`,
          );
        }

        const keyvOptions: { ttl: number; store?: KeyvRedis<unknown> } = {
          ttl: ttlMs,
        };
        if (store) {
          keyvOptions.store = store;
        }

        return {
          stores: [
            new Keyv(keyvOptions),
          ],
          ttl: ttlMs,
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    TenantsModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    CouponsModule,
    WishlistModule,
    UsersModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}