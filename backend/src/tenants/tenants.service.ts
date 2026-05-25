import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Tenant, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';
import { BaseService } from '../common/base/base.service';

const publicConfigSelect = {
  id: true,
  slug: true,
  storeName: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  bannerUrl: true,
  storeDescription: true,
} satisfies Prisma.TenantSelect;

@Injectable()
export class TenantsService extends BaseService<Tenant> {
  constructor(private readonly prisma: PrismaService) {
    super('Tenant');
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    return this.ensureEntityFound(tenant, id);
  }

  findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async getTenantConfig(slug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug, isActive: true },
      select: publicConfigSelect,
    });

    return this.ensureFound(tenant, 'Tenant', slug);
  }

  async updateTenantConfig(
    slug: string,
    userTenantId: number,
    userRole: UserRole,
    data: UpdateTenantConfigDto,
  ) {
    const tenant = await this.findBySlug(slug);

    this.ensureFound(tenant && tenant.isActive ? tenant : null, 'Tenant', slug);

    if (userRole !== UserRole.ADMIN || userTenantId !== tenant!.id) {
      throw new ForbiddenException(
        'Only an admin of this tenant can update store configuration',
      );
    }

    return this.prisma.tenant.update({
      where: { slug },
      data,
      select: publicConfigSelect,
    });
  }

  create(data: { name: string; slug: string; email: string }) {
    return this.prisma.tenant.create({ data });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      slug: string;
      email: string;
      isActive: boolean;
    }>,
  ) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }
}
