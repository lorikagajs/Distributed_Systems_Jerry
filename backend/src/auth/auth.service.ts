import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_ROLE_NAME } from './constants';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, JwtPayload } from './interfaces';

type UserWithRoles = {
  id: number;
  tenantId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: { id: number; name: string; description: string | null }[];
};

@Injectable()
export class AuthService {
  private readonly accessTokenSecret =
    process.env.JWT_SECRET ?? 'distributed-systems-jerry-dev-secret';
  private readonly refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET ??
    'distributed-systems-jerry-dev-refresh-secret';
  private readonly accessTokenExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
    '15m') as JwtSignOptions['expiresIn'];
  private readonly refreshTokenExpiresIn = (process.env
    .JWT_REFRESH_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: registerDto.tenantId },
      select: { id: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: registerDto.tenantId,
          email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists for this tenant');
    }

    const defaultRole = await this.prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId: registerDto.tenantId,
          name: DEFAULT_ROLE_NAME,
        },
      },
      update: {},
      create: {
        tenantId: registerDto.tenantId,
        name: DEFAULT_ROLE_NAME,
        description: 'Default customer role',
      },
    });

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId: registerDto.tenantId,
        email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roles: {
          connect: { id: defaultRole.id },
        },
      },
      include: {
        roles: true,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: loginDto.tenantId,
          email,
        },
      },
      include: {
        roles: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    let payload: JwtPayload & { tokenType?: string };

    try {
      payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refresh_token,
        {
          secret: this.refreshTokenSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        isActive: true,
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  async me(currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: currentUser.id,
        tenantId: currentUser.tenantId,
        isActive: true,
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    return this.toProfile(user);
  }

  private async buildAuthResponse(user: UserWithRoles) {
    const profile = this.toProfile(user);
    const roles = user.roles.map((role) => role.name);
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(
        { ...payload, tokenType: 'refresh' },
        {
          secret: this.refreshTokenSecret,
          expiresIn: this.refreshTokenExpiresIn,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: profile,
    };
  }

  private toProfile(user: UserWithRoles) {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
