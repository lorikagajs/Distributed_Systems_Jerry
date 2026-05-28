import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
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
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const ttlMs = Number(config.get('CACHE_TTL', 60)) * 1000;
        const redisUrl = config.get<string>(
          'REDIS_URL',
          'redis://localhost:6379',
        );
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(redisUrl),
              ttl: ttlMs,
            }),
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