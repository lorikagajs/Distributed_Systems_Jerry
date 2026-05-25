import { Controller, Get, Req, NotFoundException } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Public()
  @Get('config')
  getConfig(@Req() req: any) {
    const tenant = req['tenant'];
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return {
      id: tenant.id,
      slug: tenant.slug,
      storeName: tenant.storeName || tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      bannerUrl: tenant.bannerUrl,
      storeDescription: tenant.storeDescription,
    };
  }
}
