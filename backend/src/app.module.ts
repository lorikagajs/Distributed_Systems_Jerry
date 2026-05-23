import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [PrismaModule, TenantsModule, CategoriesModule, CouponsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
