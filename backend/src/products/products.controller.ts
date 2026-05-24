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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantQueryDto } from '../common/dto/tenant-query.dto';
import { resolveTenantId } from '../common/utils/resolve-tenant-id';
import { CreateProductDto } from './dto/create-product.dto';
import { PublicProductQueryDto } from './dto/public-product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BaseController } from '../common/base/base.controller';

@ApiTags('Products')
@Controller('products')
export class ProductsController extends BaseController<ProductsService> {
  constructor(productsService: ProductsService) {
    super(productsService);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List products with optional name, category, and price filters',
  })
  findAll(@Query() query: PublicProductQueryDto, @Req() req: Request) {
    const { tenantId: queryTenantId, ...filters } = query;
    const tenantId = resolveTenantId(req.tenant, queryTenantId);
    return this.service.findAll(tenantId, filters);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
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
  @ApiOperation({ summary: 'Create a product (admin only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.service.create(this.tenantIdFrom(user), dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a product image (admin only)',
    description:
      'Uploads an image to Cloudinary and appends it to the product gallery. Sets imageUrl if the product has no primary image yet.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB)',
        },
      },
    },
  })
  uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(this.tenantIdFrom(user), id, file);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(this.tenantIdFrom(user), id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(this.tenantIdFrom(user), id);
  }
}
