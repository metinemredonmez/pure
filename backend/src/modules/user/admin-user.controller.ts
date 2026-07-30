import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  AdminUserQueryDto,
  AdminUpdateRoleDto,
  AdminBanUserDto,
  AdminCreateUserDto,
} from './dto/user.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  getUsers(@Query() query: AdminUserQueryDto) {
    return this.userService.adminGetUsers(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (admin)' })
  getStats() {
    return this.userService.adminGetUserStats();
  }

  @Post()
  @ApiOperation({ summary: 'Create panel user (admin) — ADMIN/SUPPORT/SALES' })
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.userService.adminCreateUser(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  getUserById(@Param('id') id: string) {
    return this.userService.adminGetUserById(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role (admin)' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: AdminUpdateRoleDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.userService.adminUpdateRole(id, dto.role, adminId);
  }

  @Patch(':id/ban')
  @ApiOperation({ summary: 'Ban or unban user (admin)' })
  banUser(
    @Param('id') id: string,
    @Body() dto: AdminBanUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.userService.adminBanUser(id, dto.banned, dto.reason, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user permanently (admin)' })
  deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.userService.adminDeleteUser(id, adminId);
  }
}
