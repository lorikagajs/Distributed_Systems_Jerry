import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiBody({
    schema: {
      example: {
        name: 'Company A',
        slug: 'company-a',
        email: 'admin@companya.com'
      }
    }
  })
  create(@Body() body:  CreateTenantDto) {
    return this.tenantsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.update(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(+id);
  }
}