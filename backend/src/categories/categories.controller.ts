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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for a tenant' })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Categories returned successfully.' })
  findAll(@Query() query: TenantQueryDto) {
    return this.categoriesService.findAll(query.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Category returned successfully.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
  ) {
    return this.categoriesService.findOne(id, query.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCreatedResponse({ description: 'Category created successfully.' })
  create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ description: 'Category updated successfully.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, query.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category for a tenant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'tenantId', type: Number, required: true })
  @ApiOkResponse({ description: 'Category deleted successfully.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TenantQueryDto,
  ) {
    return this.categoriesService.remove(id, query.tenantId);
  }
}
