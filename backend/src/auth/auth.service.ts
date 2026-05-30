import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.interface';

import { RefreshTokenDto } from './dto/refresh-token.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${dto.tenantId} not found`);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: dto.tenantId,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered for this tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name?.trim() || null,
        password: hashedPassword,
        tenantId: dto.tenantId,
        role: dto.role ?? UserRole.CUSTOMER,
      },
      select: this.userSelect(),
    });

    return { user };
  }

  async login(dto: LoginDto) {
    const whereClause: { email: string; tenantId?: number } = { email: dto.email };
    if (dto.tenantId != null) {
      whereClause.tenantId = dto.tenantId;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
    });

    let authenticatedUser: User | null = null;

    for (const user of users) {
      const passwordValid = await bcrypt.compare(dto.password, user.password);
      if (passwordValid) {
        authenticatedUser = user;
        break;
      }
    }

    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (authenticatedUser.isBlocked) {
      throw new UnauthorizedException('This account has been blocked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authenticatedUser.id },
      select: this.userSelect(),
    });

    return {
      access_token: this.signToken(authenticatedUser),
      refresh_token: this.signRefreshToken(authenticatedUser),
      user: user!,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      if (!payload.sub || payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isBlocked) {
        throw new UnauthorizedException('This account has been blocked');
      }

      return {
        access_token: this.signToken(user),
        refresh_token: this.signRefreshToken(user),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async me(userId: number, tenantId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      select: this.userSelect(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRATION || '1h') as any,
    });
  }

  private signRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      userId: user.id,
      tenantId: user.tenantId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      isBlocked: true,
      createdAt: true,
    } as const;
  }
}
