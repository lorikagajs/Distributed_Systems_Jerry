import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/jwt-payload.interface';
import { BaseController } from '../common/base/base.controller';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController extends BaseController<UsersService> {
  constructor(usersService: UsersService) {
    super(usersService);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.service.create(this.tenantIdFrom(user), dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all users for the tenant (admin only)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(this.tenantIdFrom(user));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.service.getProfile(this.tenantIdFrom(user), user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.service.updateProfile(
      this.tenantIdFrom(user),
      user.userId,
      dto.name,
    );
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.service.changePassword(
      this.tenantIdFrom(user),
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('my-reviews')
  @ApiOperation({ summary: 'List reviews written by the current user' })
  getMyReviews(@CurrentUser() user: AuthUser) {
    return this.service.findMyReviews(this.tenantIdFrom(user), user.userId);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user account' })
  deleteProfile(@CurrentUser() user: AuthUser) {
    return this.service.deleteProfile(this.tenantIdFrom(user), user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a user' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.forbidUnless(user.role === UserRole.ADMIN || user.userId === id);

    return this.service.findOne(this.tenantIdFrom(user), id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    this.forbidUnless(user.role === UserRole.ADMIN || user.userId === id);

    // Prevent non-admin users from escalating their own role
    this.forbidUnless(
      user.role === UserRole.ADMIN || dto.role === undefined,
      'Access denied: cannot change your own role',
    );

    return this.service.update(this.tenantIdFrom(user), id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    this.forbidUnless(user.userId !== id, 'Cannot delete yourself');

    return this.service.remove(this.tenantIdFrom(user), id);
  }
}
