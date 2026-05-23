import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.interface';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
        password: hashedPassword,
        tenantId: dto.tenantId,
        role: dto.role ?? UserRole.CUSTOMER,
      },
      select: this.userSelect(),
    });

    return { user };
  }

  async login(dto: LoginDto) {
    const users = await this.prisma.user.findMany({
      where: { email: dto.email },
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

    return {
      access_token: this.signToken(authenticatedUser),
    };
  }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return this.jwtService.sign(payload);
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      role: true,
      tenantId: true,
      createdAt: true,
    } as const;
  }
}
