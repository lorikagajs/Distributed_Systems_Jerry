import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BaseController } from '../common/base/base.controller';
import { TenantQueryDto } from '../common/dto/tenant-query.dto';
import { resolveTenantId } from '../common/utils/resolve-tenant-id';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController extends BaseController<CategoriesService> {
  constructor(categoriesService: CategoriesService) {
    super(categoriesService);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all categories for a tenant' })
  findAll(@Query() query: TenantQueryDto, @Req() req: Request) {
    const tenantId = resolveTenantId(req.tenant, query.tenantId);
    return this.service.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
    @Req() req: Request,
  ) {
    const tenantId = resolveTenantId(req.tenant, query.tenantId);
    return this.service.findOne(tenantId, id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a category (admin only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.service.create(this.tenantIdFrom(user), dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(this.tenantIdFrom(user), id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(this.tenantIdFrom(user), id);
  }
}
