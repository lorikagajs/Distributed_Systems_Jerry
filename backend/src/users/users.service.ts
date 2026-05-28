import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  name: true,
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

  private displayName(user: { name: string | null; email: string }) {
    const trimmed = user.name?.trim();
    if (trimmed) return trimmed;
    return user.email.split('@')[0];
  }

  private toProfileResponse(user: UserResponse) {
    return {
      ...user,
      name: this.displayName(user),
    };
  }

  async getProfile(tenantId: number, userId: number) {
    const user = await this.findOne(tenantId, userId);
    return this.toProfileResponse(user);
  }

  async updateProfile(tenantId: number, userId: number, name: string) {
    await this.findOne(tenantId, userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: this.userSelect(),
    });
    return this.toProfileResponse(user);
  }

  async changePassword(
    tenantId: number,
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
      },
    });

    return { message: 'Password updated successfully' };
  }

  findMyReviews(tenantId: number, userId: number) {
    return this.prisma.review.findMany({
      where: { tenantId, userId },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async deleteProfile(tenantId: number, userId: number) {
    await this.findOne(tenantId, userId);

    const orderCount = await this.prisma.order.count({
      where: { userId, tenantId },
    });
    if (orderCount > 0) {
      throw new BadRequestException(
        'Cannot delete an account that has existing orders',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { userId, tenantId } });
      await tx.cartItem.deleteMany({
        where: { cart: { userId, tenantId } },
      });
      await tx.cart.deleteMany({ where: { userId, tenantId } });
      await tx.address.deleteMany({ where: { userId } });
      await tx.wishlistItem.deleteMany({
        where: { wishlist: { userId, tenantId } },
      });
      await tx.wishlist.deleteMany({ where: { userId, tenantId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }
}
