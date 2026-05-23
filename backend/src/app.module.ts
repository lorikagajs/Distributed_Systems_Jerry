import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, TenantsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
