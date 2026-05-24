import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

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
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tenant.findMany();
  }

  findOne(id: number) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async getTenantConfig(slug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug, isActive: true },
      select: publicConfigSelect,
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${slug}" not found`);
    }

    return tenant;
  }

  async updateTenantConfig(
    slug: string,
    userTenantId: number,
    userRole: UserRole,
    data: UpdateTenantConfigDto,
  ) {
    const tenant = await this.findBySlug(slug);

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException(`Tenant "${slug}" not found`);
    }

    if (userRole !== UserRole.ADMIN || userTenantId !== tenant.id) {
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

  update(
    id: number,
    data: Partial<{
      name: string;
      slug: string;
      email: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.tenant.delete({ where: { id } });
  }
}
