import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import { BaseService } from '../common/base/base.service';
import { TenantScopedCrudService } from '../common/interfaces/crud-service.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 10;
const userSelect = {
  id: true,
  email: true,
  role: true,
  tenantId: true,
  createdAt: true,
} as const;

type UserResponse = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

@Injectable()
export class UsersService
  extends BaseService<UserResponse>
  implements TenantScopedCrudService<UserResponse, CreateUserDto, UpdateUserDto>
{
  constructor(private readonly prisma: PrismaService) {
    super('User');
  }

  findAll(tenantId: number) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: this.userSelect(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: number, id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: this.userSelect(),
    });

    return this.ensureEntityFound(user, id);
  }

  async create(tenantId: number, dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered for this tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        tenantId,
        role: dto.role ?? UserRole.CUSTOMER,
      },
      select: this.userSelect(),
    });
  }

  async update(tenantId: number, id: number, dto: UpdateUserDto) {
    // Ensure user exists in tenant scope
    await this.findOne(tenantId, id);

    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          tenantId,
          email: dto.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered for this tenant');
      }
    }

    const data: Prisma.UserUpdateInput = {
      email: dto.email,
      role: dto.role,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect(),
    });
  }

  async remove(tenantId: number, id: number) {
    // Ensure user exists in tenant scope
    await this.findOne(tenantId, id);
    return this.prisma.user.delete({
      where: { id },
      select: this.userSelect(),
    });
  }

  userSelect() {
    return userSelect;
  }
}
