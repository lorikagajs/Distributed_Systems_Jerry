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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { TenantRequest } from '../tenants/interfaces/tenant-request.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description:
    'Tenant ID fallback for testing when Authorization bearer token is not provided',
})
@Controller('products')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products for a tenant' })
  findAll(@Query() query: QueryProductsDto, @Req() request: TenantRequest) {
    return this.productsService.findAll(query, request.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: TenantRequest,
  ) {
    return this.productsService.findOne(id, request.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() body: CreateProductDto, @Req() request: TenantRequest) {
    return this.productsService.create(body, request.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @Req() request: TenantRequest,
  ) {
    return this.productsService.update(id, request.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: TenantRequest) {
    return this.productsService.remove(id, request.tenantId);
  }
}
