import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';
import { TenantsService } from './tenants.service';
import { BaseController } from '../common/base/base.controller';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController extends BaseController<TenantsService> {
  constructor(tenantsService: TenantsService) {
    super(tenantsService);
  }

  @Public()
  @Get(':slug/config')
  @ApiOperation({ summary: 'Get public store configuration for a tenant' })
  @ApiParam({ name: 'slug', example: 'tech-store' })
  getConfig(@Param('slug') slug: string) {
    return this.service.getTenantConfig(slug);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':slug/config')
  @ApiOperation({ summary: 'Update store configuration (tenant admin only)' })
  @ApiParam({ name: 'slug', example: 'tech-store' })
  updateConfig(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTenantConfigDto,
  ) {
    return this.service.updateTenantConfig(
      slug,
      user.tenantId,
      user.role,
      dto,
    );
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get a tenant by numeric ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiBody({
    schema: {
      example: {
        name: 'Company A',
        slug: 'company-a',
        email: 'admin@companya.com',
      },
    },
  })
  create(@Body() body: CreateTenantDto) {
    return this.service.create(body);
  }

  @Public()
  @Put('by-id/:id')
  @ApiOperation({ summary: 'Update a tenant by numeric ID' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(+id, body);
  }

  @Public()
  @Delete('by-id/:id')
  @ApiOperation({ summary: 'Delete a tenant by numeric ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
